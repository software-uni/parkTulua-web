import type { CodigoTipoVehiculo, TipoVehiculoConfig } from '../types/parqueadero.types';
import { TipoVehiculoFila } from './TipoVehiculoFila';

interface TiposVehiculoCardProps {
  tipos: TipoVehiculoConfig[];
  onAdmiteChange: (codigo: CodigoTipoVehiculo, admite: boolean) => void;
  onCapacidadChange: (codigo: CodigoTipoVehiculo, capacidad: number) => void;
}

export function TiposVehiculoCard({ tipos, onAdmiteChange, onCapacidadChange }: TiposVehiculoCardProps) {
  return (
    <section className="rounded-card border border-neutro-300 bg-neutro-0 p-6 shadow-card">
      <h2 className="text-lg font-bold text-neutro-900">2 · Tipos de vehículo admitidos</h2>
      <p className="mt-1 text-sm text-neutro-600">
        Define qué tipos recibes y cuántos cupos tiene cada uno.
      </p>

      <div className="mb-2 mt-6 hidden grid-cols-3 gap-4 border-b border-neutro-100 pb-2 text-xs font-semibold uppercase tracking-wider text-neutro-600 sm:grid">
        <div>Tipo de vehículo</div>
        <div className="text-center">Admite</div>
        <div className="text-center">Capacidad</div>
      </div>

      <div className="flex flex-col">
        {tipos.map((tipo) => (
          <TipoVehiculoFila
            key={tipo.codigo}
            codigo={tipo.codigo}
            admite={tipo.admite}
            capacidad={tipo.capacidad}
            onAdmiteChange={(admite) => onAdmiteChange(tipo.codigo, admite)}
            onCapacidadChange={(capacidad) => onCapacidadChange(tipo.codigo, capacidad)}
          />
        ))}
      </div>

      <p className="mt-6 border-t border-neutro-100 pt-4 text-xs text-neutro-600">
        Una reserva de un tipo solo usa los cupos de ese tipo.
      </p>
    </section>
  );
}