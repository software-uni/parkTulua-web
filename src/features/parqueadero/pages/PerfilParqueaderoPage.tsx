import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { DatosParqueaderoCard } from '../components/DatosParqueaderoCard';
import { TiposVehiculoCard } from '../components/TiposVehiculoCard';
import type { CodigoTipoVehiculo, TipoVehiculoConfig } from '../types/parqueadero.types';
import {
  perfilParqueaderoSchema,
  type PerfilParqueaderoFormValues,
} from '../types/perfilParqueadero.schema';

/** Datos del diseño de Figma, provisionales hasta conectar useParqueaderoPerfil. */
const VALORES_PROVISIONALES: PerfilParqueaderoFormValues = {
  nombre: 'Parqueadero Central',
  direccion: 'Carrera 25 # 26-10, Tuluá',
  latitud: 4.0847,
  longitud: -76.1954,
  tipos: [
    { codigo: 'automovil', admite: true, capacidad: 40, cuposReservables: 0, tarifaHora: null },
    { codigo: 'motocicleta', admite: true, capacidad: 30, cuposReservables: 0, tarifaHora: null },
    { codigo: 'bicicleta', admite: true, capacidad: 20, cuposReservables: 0, tarifaHora: null },
  ],
};

export function PerfilParqueaderoPage() {
  const {
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<PerfilParqueaderoFormValues>({
    resolver: zodResolver(perfilParqueaderoSchema),
    defaultValues: VALORES_PROVISIONALES,
  });

  const nombre = useWatch({ control, name: 'nombre' });
  const direccion = useWatch({ control, name: 'direccion' });
  const tipos = useWatch({ control, name: 'tipos' });

  const opcionesCambio = { shouldDirty: true, shouldValidate: true } as const;

  function cambiarTipo(codigo: CodigoTipoVehiculo, cambios: Partial<TipoVehiculoConfig>) {
    const indice = tipos.findIndex((tipo) => tipo.codigo === codigo);
    if (indice === -1) return;
    setValue(`tipos.${indice}`, { ...tipos[indice], ...cambios }, opcionesCambio);
  }

  async function guardar(valores: PerfilParqueaderoFormValues) {
    // Provisional: aquí irá useGuardarPerfil (guardarPerfil de la api).
    console.log('Se enviaría a la API:', valores);
    reset(valores);
  }

  return (
    <form onSubmit={handleSubmit(guardar)} noValidate className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-neutro-900">Perfil del parqueadero</h1>
        <p className="mt-1 text-sm text-neutro-600">
          Los datos de tu parqueadero y qué vehículos recibe.
        </p>
      </header>

      <DatosParqueaderoCard
        nombre={nombre}
        direccion={direccion}
        onNombreChange={(valor) => setValue('nombre', valor, opcionesCambio)}
        onDireccionChange={(valor) => setValue('direccion', valor, opcionesCambio)}
      />

      <TiposVehiculoCard
        tipos={tipos}
        onAdmiteChange={(codigo, admite) => cambiarTipo(codigo, { admite })}
        onCapacidadChange={(codigo, capacidad) => cambiarTipo(codigo, { capacidad })}
      />

      <div className="flex flex-col-reverse items-center gap-4 border-t border-neutro-300 pt-6 sm:flex-row sm:justify-between">
        <p className="text-xs text-neutro-600">Los cambios aplican solo a este parqueadero.</p>
        <div className="flex w-full gap-4 sm:w-auto">
          <button
            type="button"
            disabled={!isDirty || isSubmitting}
            onClick={() => reset()}
            className="w-full rounded-btn border border-neutro-300 bg-neutro-0 px-4 py-2 text-sm font-medium text-neutro-900 hover:bg-neutro-100 focus-visible:outline-2 focus-visible:outline-marca-primario disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="w-full rounded-btn bg-marca-primario px-4 py-2 text-sm font-medium text-neutro-0 shadow-card hover:bg-marca-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-primario disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  );
}