import { Check } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { DESCRIPCION_ROL, ETIQUETA_ROL, ROLES_ASIGNABLES } from '../types/usuario.types';

interface Props {
  registro: UseFormRegisterReturn<'rol'>;
  error?: string;
}

export function RolSelector({ registro, error }: Props) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="sr-only">Rol del nuevo usuario</legend>
      <div className="grid gap-4 md:grid-cols-3">
        {ROLES_ASIGNABLES.map((rol) => (
          <label
            key={rol}
            className="group relative flex cursor-pointer flex-col gap-1.5 rounded-card border-2 border-neutro-300 bg-neutro-0 px-[18px] py-4 transition-colors hover:bg-neutro-100 has-checked:border-marca-primario has-checked:bg-marca-claro has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-primario"
          >
            <input type="radio" value={rol} {...registro} className="sr-only" />
            <span className="flex items-center justify-between text-base font-semibold text-neutro-900 group-has-checked:text-marca-oscuro">
              {ETIQUETA_ROL[rol]}
              <span
                aria-hidden="true"
                className="hidden size-[22px] items-center justify-center rounded-chip bg-marca-primario text-neutro-0 group-has-checked:flex"
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            </span>
            <span className="text-[13px] text-neutro-600">{DESCRIPCION_ROL[rol]}</span>
          </label>
        ))}

        {/* «Personalizado» y la matriz de permisos dependen de D-ER3-12 (UNI-15); PERMISO_MODULO está diferida. */}
        <div
          aria-disabled="true"
          className="flex cursor-not-allowed flex-col gap-1.5 rounded-card border-2 border-dashed border-neutro-300 bg-neutro-100 px-[18px] py-4 opacity-70"
        >
          <span className="flex items-center justify-between text-base font-semibold text-neutro-900">
            Personalizado
            <span className="rounded-chip bg-neutro-300 px-2 py-0.5 text-[11px] font-semibold text-neutro-600">
              Próximamente
            </span>
          </span>
          <span className="text-[13px] text-neutro-600">Eliges tú cada permiso, uno por uno.</span>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-estado-lleno-texto">
          {error}
        </p>
      )}
    </fieldset>
  );
}