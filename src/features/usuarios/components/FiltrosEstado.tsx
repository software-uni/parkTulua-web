import { cn } from '../../../core/lib/cn';
import type { FiltroEstado } from '../types/usuario.types';

interface Props {
  valor: FiltroEstado;
  onChange: (valor: FiltroEstado) => void;
  conteos: Record<FiltroEstado, number>;
}

const OPCIONES: ReadonlyArray<{ valor: FiltroEstado; etiqueta: string }> = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'activo', etiqueta: 'Activos' },
  { valor: 'inactivo', etiqueta: 'Inactivos' },
];

export function FiltrosEstado({ valor, onChange, conteos }: Props) {
  return (
    <div role="group" aria-label="Filtrar por estado" className="flex gap-2">
      {OPCIONES.map((opcion) => {
        const activo = opcion.valor === valor;
        return (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={activo}
            onClick={() => onChange(opcion.valor)}
            className={cn(
              'rounded-chip border px-[18px] py-[9px] text-sm font-semibold transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-primario',
              activo
                ? 'border-marca-primario bg-marca-primario text-neutro-0'
                : 'border-neutro-300 bg-neutro-0 text-neutro-600 hover:bg-neutro-100',
            )}
          >
            {opcion.etiqueta} · {conteos[opcion.valor]}
          </button>
        );
      })}
    </div>
  );
}