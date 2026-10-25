import { ETIQUETA_TIPO_VEHICULO, type CodigoTipoVehiculo } from '../types/parqueadero.types';
import { CapacidadStepper } from './CapacidadStepper';

interface TipoVehiculoFilaProps {
  codigo: CodigoTipoVehiculo;
  admite: boolean;
  capacidad: number;
  onAdmiteChange: (admite: boolean) => void;
  onCapacidadChange: (capacidad: number) => void;
}

export function TipoVehiculoFila({
  codigo,
  admite,
  capacidad,
  onAdmiteChange,
  onCapacidadChange,
}: TipoVehiculoFilaProps) {
  const etiqueta = ETIQUETA_TIPO_VEHICULO[codigo];

  return (
    <div className="flex flex-col items-center gap-4 border-b border-neutro-100 py-3 last:border-0 sm:grid sm:grid-cols-3">
      <div className="flex w-full items-center gap-3 sm:w-auto">
        <div
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-btn bg-marca-claro text-sm font-bold text-marca-primario"
        >
          {etiqueta.charAt(0)}
        </div>
        <span className="text-sm font-medium text-neutro-900">{etiqueta}</span>
      </div>

      <div className="flex w-full items-center justify-between sm:w-auto sm:justify-center">
        <span className="text-sm text-neutro-600 sm:hidden">Admite</span>
        <button
          type="button"
          role="switch"
          aria-checked={admite}
          aria-label={`Admite ${etiqueta.toLowerCase()}`}
          onClick={() => onAdmiteChange(!admite)}
          className={`relative inline-flex h-6 w-11 items-center rounded-chip transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-primario ${
            admite ? 'bg-marca-primario' : 'bg-neutro-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-chip bg-neutro-0 transition-transform ${
              admite ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex w-full items-center justify-between sm:w-auto sm:justify-center">
        <span className="text-sm text-neutro-600 sm:hidden">Capacidad</span>
        <CapacidadStepper
          valor={capacidad}
          etiqueta={etiqueta.toLowerCase()}
          deshabilitado={!admite}
          onCambiar={onCapacidadChange}
        />
      </div>
    </div>
  );
}