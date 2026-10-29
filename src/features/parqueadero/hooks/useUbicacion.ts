import { useCallback, useRef, useState } from 'react';
import {
  direccionDesdeCoordenadas,
  obtenerPosicionActual,
  type Coordenadas,
} from '../api/ubicacionApi';

export interface UbicacionResultado extends Coordenadas {
  /** Nula si se ubicó el punto pero no se pudo obtener la dirección. */
  direccion: string | null;
}

const redondear = (n: number) => Number(n.toFixed(6)); // igual que las coordenadas guardadas en la base

export function useUbicacion(onResultado: (resultado: UbicacionResultado) => void) {
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const ultimaSolicitud = useRef(0);

  const resolver = useCallback(
    async (obtenerCoordenadas: () => Promise<Coordenadas>) => {
      const id = ++ultimaSolicitud.current;
      const vigente = () => id === ultimaSolicitud.current; // ignora respuestas viejas
      setCargando(true);
      setAviso(null);
      try {
        const bruto = await obtenerCoordenadas();
        const coordenadas = { latitud: redondear(bruto.latitud), longitud: redondear(bruto.longitud) };

        let direccion: string | null = null;
        try {
          direccion = await direccionDesdeCoordenadas(coordenadas);
        } catch {
          if (vigente()) {
            setAviso('Ubicamos el punto en el mapa, pero no pudimos obtener la dirección. Escríbela a mano.');
          }
        }
        if (vigente()) onResultado({ ...coordenadas, direccion });
      } catch (error) {
        if (vigente()) {
          setAviso(error instanceof Error ? error.message : 'No se pudo obtener la ubicación.');
        }
      } finally {
        if (vigente()) setCargando(false);
      }
    },
    [onResultado],
  );

  const obtenerActual = useCallback(() => resolver(obtenerPosicionActual), [resolver]);
  const ubicarEn = useCallback(
    (coordenadas: Coordenadas) => resolver(async () => coordenadas),
    [resolver],
  );

  return { cargando, aviso, obtenerActual, ubicarEn };
}