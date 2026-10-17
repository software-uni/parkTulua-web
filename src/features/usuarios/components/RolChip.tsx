import { cn } from '../../../core/lib/cn';
import { ETIQUETA_ROL, type RolPersonal } from '../types/usuario.types';

const ESTILOS: Record<RolPersonal, string> = {
  propietario: 'bg-marca-claro text-marca-oscuro',
  operador: 'bg-[#f0eff6] text-neutro-600',
  supervisor: 'bg-[#e0f3f6] text-[#1f9bb0]',
};

export function RolChip({ rol }: { rol: RolPersonal }) {
  return (
    <span
      className={cn('inline-flex rounded-chip px-2.5 py-1 text-xs font-semibold', ESTILOS[rol])}
    >
      {ETIQUETA_ROL[rol]}
    </span>
  );
}