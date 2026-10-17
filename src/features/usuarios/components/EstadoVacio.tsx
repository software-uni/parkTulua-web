import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  tono?: 'neutro' | 'error';
}

export function EstadoVacio({ titulo, descripcion, accion, tono = 'neutro' }: Props) {
  return (
    <div
      role={tono === 'error' ? 'alert' : 'status'}
      className="flex flex-col items-center gap-2 rounded-card border border-neutro-300 bg-neutro-0 px-6 py-12 text-center"
    >
      <p
        className={
          tono === 'error'
            ? 'font-semibold text-estado-lleno-texto'
            : 'font-semibold text-neutro-900'
        }
      >
        {titulo}
      </p>
      {descripcion && <p className="max-w-md text-sm text-neutro-600">{descripcion}</p>}
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  );
}