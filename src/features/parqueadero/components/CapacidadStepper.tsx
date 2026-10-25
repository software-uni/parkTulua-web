interface CapacidadStepperProps {
  valor: number;
  /** Para el lector de pantalla, por ejemplo "automóvil". */
  etiqueta: string;
  min?: number;
  max?: number;
  deshabilitado?: boolean;
  onCambiar: (nuevoValor: number) => void;
}

const CLASES_BOTON =
  'flex h-7 w-7 items-center justify-center rounded-btn bg-marca-claro text-marca-primario transition-colors hover:bg-marca-claro/70 focus-visible:outline-2 focus-visible:outline-marca-primario disabled:cursor-not-allowed disabled:opacity-50';

export function CapacidadStepper({
  valor,
  etiqueta,
  min = 0,
  max = 9999,
  deshabilitado = false,
  onCambiar,
}: CapacidadStepperProps) {
  const limitar = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`Disminuir capacidad de ${etiqueta}`}
        disabled={deshabilitado || valor <= min}
        onClick={() => onCambiar(limitar(valor - 1))}
        className={CLASES_BOTON}
      >
        −
      </button>

      <input
        type="number"
        inputMode="numeric"
        aria-label={`Capacidad de ${etiqueta}`}
        min={min}
        max={max}
        value={valor}
        disabled={deshabilitado}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          onCambiar(Number.isNaN(n) ? min : limitar(n));
        }}
        className="w-12 rounded-btn border border-neutro-300 bg-neutro-0 py-1 text-center text-sm font-medium text-neutro-900 [appearance:textfield] disabled:bg-neutro-100 disabled:text-neutro-600 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        type="button"
        aria-label={`Aumentar capacidad de ${etiqueta}`}
        disabled={deshabilitado || valor >= max}
        onClick={() => onCambiar(limitar(valor + 1))}
        className={CLASES_BOTON}
      >
        +
      </button>
    </div>
  );
}