import {
  Map as MapaGL,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type MapMouseEvent,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useEffect, useRef, useState } from 'react';
import type { Coordenadas } from '../api/ubicacionApi';

setWorkerUrl(workerUrl);
/** Estilo gratuito de OpenFreeMap con edificios en 3D. Otros: .../styles/bright, positron. */
const ESTILO_MAPA = 'https://tiles.openfreemap.org/styles/liberty';
const INCLINACION_3D = 60;
const ROTACION_3D = -20;
const ZOOM_INICIAL = 17.5;
/** Edificios sin altura registrada en OpenStreetMap se dibujan con esta altura mínima (metros). */
const ALTURA_MINIMA_EDIFICIO_M = 8;
/** Exagera las alturas para que el 3D se note más. Pon 1 para alturas reales. */
const EXAGERACION_EDIFICIOS = 1.5;

function crearElementoPin(): HTMLDivElement {
  const elemento = document.createElement('div');
  elemento.className = 'text-marca-primario cursor-grab';
  elemento.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 24 30" aria-hidden="true"><path d="M12 0C5.4 0 0 5.2 0 11.6 0 20 12 30 12 30s12-10 12-18.4C24 5.2 18.6 0 12 0z" fill="currentColor"/><circle cx="12" cy="11.5" r="4.5" fill="#fff"/></svg>';
  return elemento;
}

interface MapaUbicacionProps {
  latitud: number;
  longitud: number;
  /** Se llama al arrastrar el marcador o hacer clic en el mapa. */
  onMover: (coordenadas: Coordenadas) => void;
  className?: string;
}

export function MapaUbicacion({ latitud, longitud, onMover, className = '' }: MapaUbicacionProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaGL | null>(null);
  const marcador = useRef<Marker | null>(null);
  const inicial = useRef<[number, number]>([longitud, latitud]); // MapLibre usa [longitud, latitud]
  const onMoverRef = useRef(onMover);
  const [en3D, setEn3D] = useState(true);

  useEffect(() => {
    onMoverRef.current = onMover;
  }, [onMover]);

  // Crea el mapa una sola vez.
  useEffect(() => {
    const elemento = contenedor.current;
    if (!elemento) return;

    const instancia = new MapaGL({
      container: elemento,
      style: ESTILO_MAPA,
      center: inicial.current,
      zoom: ZOOM_INICIAL,
      pitch: INCLINACION_3D,
      maxPitch: 75,
      bearing: ROTACION_3D,
      cooperativeGestures: true, 
      locale: {
        'CooperativeGesturesHandler.WindowsHelpText': 'Usa Ctrl + scroll para hacer zoom en el mapa',
        'CooperativeGesturesHandler.MacHelpText': 'Usa ⌘ + scroll para hacer zoom en el mapa',
        'CooperativeGesturesHandler.MobileHelpText': 'Usa dos dedos para mover el mapa',
      },
    });
    instancia.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');

    // Realza los edificios del estilo: más altos y en tonos lila según su altura.
    instancia.on('load', () => {
      if (!instancia.getLayer('building-3d')) return;
      instancia.setPaintProperty('building-3d', 'fill-extrusion-height', [
        '*',
        EXAGERACION_EDIFICIOS,
        ['max', ['coalesce', ['get', 'render_height'], 0], ALTURA_MINIMA_EDIFICIO_M],
      ]);
      instancia.setPaintProperty('building-3d', 'fill-extrusion-color', [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'render_height'], 0],
        0, '#e7e2f5',
        20, '#cfc6ee',
        60, '#b3a4e6',
      ]);
      instancia.setPaintProperty('building-3d', 'fill-extrusion-opacity', 0.92);
    });

    const pin = new Marker({ element: crearElementoPin(), anchor: 'bottom', draggable: true })
      .setLngLat(inicial.current)
      .addTo(instancia);

    pin.on('dragend', () => {
      const { lat, lng } = pin.getLngLat();
      onMoverRef.current({ latitud: lat, longitud: lng });
    });
    instancia.on('click', (evento: MapMouseEvent) => {
      pin.setLngLat(evento.lngLat);
      onMoverRef.current({ latitud: evento.lngLat.lat, longitud: evento.lngLat.lng });
    });

    // Si el menú lateral se contrae, el mapa se reajusta al nuevo ancho.
    const observador = new ResizeObserver(() => instancia.resize());
    observador.observe(elemento);

    mapa.current = instancia;
    marcador.current = pin;
    return () => {
      observador.disconnect();
      instancia.remove();
      mapa.current = null;
      marcador.current = null;
    };
  }, []);

  // Mueve el marcador cuando cambian las coordenadas del formulario.
  useEffect(() => {
    const instancia = mapa.current;
    const pin = marcador.current;
    if (!instancia || !pin || !Number.isFinite(latitud) || !Number.isFinite(longitud)) return;

    const destino: [number, number] = [longitud, latitud];
    pin.setLngLat(destino);
    if (!instancia.getBounds().contains(destino)) {
      instancia.flyTo({ center: destino, zoom: Math.max(instancia.getZoom(), 16), essential: true });
    }
  }, [latitud, longitud]);

  function alternar3D() {
    const siguiente = !en3D;
    setEn3D(siguiente);
    mapa.current?.easeTo({
      pitch: siguiente ? INCLINACION_3D : 0,
      bearing: siguiente ? ROTACION_3D : 0,
      duration: 600,
    });
  }

  return (
    <div className={`relative isolate overflow-hidden rounded-xl border border-borde-suave ${className}`}>
      <div className="absolute inset-0">
        <div
          ref={contenedor}
          role="application"
          aria-label="Mapa con la ubicación del parqueadero. Puedes arrastrar el marcador."
          className="h-full w-full"
        />
      </div>
      <button
        type="button"
        aria-pressed={en3D}
        onClick={alternar3D}
        className={`absolute left-3 top-3 z-10 rounded-btn px-3 py-1.5 text-xs font-semibold shadow-card transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-primario ${en3D ? 'bg-marca-primario text-white' : 'bg-white/95 text-neutro-900 hover:bg-white'
          }`}
      >
        Vista 3D
      </button>
    </div>
  );
}