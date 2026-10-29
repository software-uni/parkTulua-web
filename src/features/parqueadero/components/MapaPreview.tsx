import { MapPin } from 'lucide-react';

interface MapaPreviewProps {
  latitud: number;
  longitud: number;
}

export function MapaPreview({ latitud, longitud }: MapaPreviewProps) {
  const hayCoordenadas = Number.isFinite(latitud) && Number.isFinite(longitud);

  return (
    <div
      role="img"
      aria-label={
        hayCoordenadas
          ? `Vista previa del mapa. Coordenadas: ${latitud}, ${longitud}`
          : 'Vista previa del mapa. Sin coordenadas'
      }
      className="flex h-full min-h-32 flex-col items-center justify-center gap-1 rounded-xl bg-marca-claro text-center"
    >
      <MapPin className="size-4 text-marca-primario" aria-hidden="true" />
      <span className="text-xs font-medium text-marca-primario">Vista previa del mapa</span>
      <span className="text-[11px] text-neutro-600">
        {hayCoordenadas ? `${latitud.toFixed(4)}, ${longitud.toFixed(4)}` : 'Sin coordenadas'}
      </span>
    </div>
  );
}