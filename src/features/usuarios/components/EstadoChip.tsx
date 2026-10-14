import { cn } from '../../../core/lib/cn';
import { ETIQUETA_ESTADO, type EstadoAsignacion } from '../types/usuario.types';

const ESTILOS: Record<EstadoAsignacion, { chip: string; punto: string }> = {
  activo: {
    chip: 'bg-estado-disponible-bg text-estado-disponible-texto',
    punto: 'bg-estado-disponible',
  },
  inactivo: { chip: 'bg-[#f0eff6] text-neutro-600', punto: 'bg-neutro-600/50' },
};

export function EstadoChip({ estado }: { estado: EstadoAsignacion }) {
  const estilo = ESTILOS[estado];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1 text-xs font-semibold',
        estilo.chip,
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 rounded-chip', estilo.punto)} />
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}