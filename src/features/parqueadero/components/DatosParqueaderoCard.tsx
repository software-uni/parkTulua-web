import { Loader2, LocateFixed } from 'lucide-react';
import { useUbicacion, type UbicacionResultado } from '../hooks/useUbicacion';
import { MapaUbicacion } from './MapaUbicacion';

interface DatosParqueaderoCardProps {
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  onNombreChange: (value: string) => void;
  onDireccionChange: (value: string) => void;
  onUbicacionChange: (resultado: UbicacionResultado) => void;
  errorNombre?: string;
  errorDireccion?: string;
  deshabilitado?: boolean;
}

const CLASES_INPUT =
  'w-full rounded-btn border bg-neutro-0 px-4 py-3 text-sm text-neutro-900 outline-none transition placeholder:text-neutro-600/70 hover:border-marca-primario/50 focus:border-marca-primario focus:ring-2 focus:ring-marca-claro disabled:bg-neutro-100 disabled:text-neutro-600';

export function DatosParqueaderoCard({
  nombre,
  direccion,
  latitud,
  longitud,
  onNombreChange,
  onDireccionChange,
  onUbicacionChange,
  errorNombre,
  errorDireccion,
  deshabilitado = false,
}: DatosParqueaderoCardProps) {
  const { cargando, aviso, obtenerActual, ubicarEn } = useUbicacion(onUbicacionChange);

  return (
    <section className="rounded-card border border-borde-suave bg-neutro-0 p-5 shadow-card sm:p-6">
      <h2 className="mb-5 text-base font-bold text-neutro-900">1 · Datos</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre" className="text-sm font-semibold text-neutro-900">
              Nombre del parqueadero
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              disabled={deshabilitado}
              onChange={(e) => onNombreChange(e.target.value)}
              placeholder="Ej. Parqueadero Central"
              aria-invalid={!!errorNombre}
              aria-describedby={errorNombre ? 'nombre-error' : undefined}
              className={`${CLASES_INPUT} ${errorNombre ? 'border-red-500' : 'border-neutro-300'}`}
            />
            {errorNombre && (
              <p id="nombre-error" className="text-xs text-red-600">
                {errorNombre}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="direccion" className="text-sm font-semibold text-neutro-900">
              Dirección
            </label>
            <input
              id="direccion"
              type="text"
              value={direccion}
              disabled={deshabilitado}
              onChange={(e) => onDireccionChange(e.target.value)}
              placeholder="Ej. Carrera 25 # 24-10, Tuluá"
              aria-invalid={!!errorDireccion}
              aria-describedby={errorDireccion ? 'direccion-error' : undefined}
              className={`${CLASES_INPUT} ${errorDireccion ? 'border-red-500' : 'border-neutro-300'}`}
            />
            {errorDireccion && (
              <p id="direccion-error" className="text-xs text-red-600">
                {errorDireccion}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={() => {
                void obtenerActual();
              }}
              disabled={cargando || deshabilitado}
              className="inline-flex items-center gap-2 rounded-btn border border-marca-primario/30 bg-marca-claro px-4 py-2.5 text-sm font-semibold text-marca-primario transition-colors hover:bg-marca-claro/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-primario disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LocateFixed className="size-4" aria-hidden="true" />
              )}
              {cargando ? 'Obteniendo ubicación…' : 'Obtener ubicación del parqueadero'}
            </button>
            {aviso && (
              <p role="status" className="text-xs text-red-600">
                {aviso}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-neutro-900">Ubicación en el mapa</span>
          <MapaUbicacion
            latitud={latitud}
            longitud={longitud}
            onMover={(coordenadas) => {
              void ubicarEn(coordenadas);
            }}
            className="min-h-80 flex-1 md:min-h-[26rem]"
          />
          <p className="text-xs text-neutro-600">
            {latitud.toFixed(4)}, {longitud.toFixed(4)} · Arrastra el marcador o haz clic en el mapa para
            ajustarlo.
          </p>
        </div>
      </div>
    </section>
  );
}