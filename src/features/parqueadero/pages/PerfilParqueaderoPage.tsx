import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { DatosParqueaderoCard } from '../components/DatosParqueaderoCard';
import { TiposVehiculoCard } from '../components/TiposVehiculoCard';
import { useGuardarPerfil } from '../hooks/useGuardarPerfil';
import { useMiParqueaderoId } from '../hooks/useMiParqueaderoId';
import { useParqueaderoPerfil } from '../hooks/useParqueaderoPerfil';
import { MapPin } from 'lucide-react';
import type { UbicacionResultado } from '../hooks/useUbicacion';
import { toast } from 'sonner';

import type {
  CodigoTipoVehiculo,
  PerfilParqueadero,
  TipoVehiculoConfig,
} from '../types/parqueadero.types';
import {
  perfilParqueaderoSchema,
  type PerfilParqueaderoFormValues,
} from '../types/perfilParqueadero.schema';

/** El formulario no maneja el id; lo conserva el perfil original. */
function perfilAValores(perfil: PerfilParqueadero): PerfilParqueaderoFormValues {
  return {
    nombre: perfil.nombre,
    direccion: perfil.direccion,
    latitud: perfil.latitud,
    longitud: perfil.longitud,
    tipos: perfil.tipos,
  };
}

const opcionesCambio = { shouldDirty: true, shouldValidate: true } as const;

/** Carga el parqueadero del propietario y, cuando ya está, muestra el formulario. */
export function PerfilParqueaderoPage() {
  const idQuery = useMiParqueaderoId();
  const perfilQuery = useParqueaderoPerfil(idQuery.data);

  const isLoading = idQuery.isLoading || perfilQuery.isLoading;
  const error = idQuery.error ?? perfilQuery.error;
  const perfil = perfilQuery.data;

  if (isLoading) {
    return <p className="p-6 text-sm text-neutro-600">Cargando perfil…</p>;
  }

  if (error || !perfil) {
    const reintentar = () => (idQuery.isError ? idQuery.refetch() : perfilQuery.refetch());
    return (
      <div className="p-6 text-sm">
        <p className="text-red-600">{error?.message ?? 'No se pudo cargar el perfil.'}</p>
        <button type="button" onClick={reintentar} className="mt-3 font-semibold text-marca-primario">
          Reintentar
        </button>
      </div>
    );
  }

  return <PerfilParqueaderoForm perfil={perfil} />;
}

function PerfilParqueaderoForm({ perfil }: { perfil: PerfilParqueadero }) {
  const guardarMutation = useGuardarPerfil(perfil.parqueaderoId);

  const {
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<PerfilParqueaderoFormValues>({
    resolver: zodResolver(perfilParqueaderoSchema),
    // El formulario nace con los datos reales: nunca hay un render con valores vacíos.
    defaultValues: perfilAValores(perfil),
    // Si el perfil se refresca desde la base, se actualiza sin pisar lo que el usuario ya editó.
    values: perfilAValores(perfil),
    resetOptions: { keepDirtyValues: true },
  });

  const nombre = useWatch({ control, name: 'nombre' });
  const direccion = useWatch({ control, name: 'direccion' });
  const latitud = useWatch({ control, name: 'latitud' });
  const longitud = useWatch({ control, name: 'longitud' });
  const tipos = useWatch({ control, name: 'tipos' });

  function aplicarUbicacion(resultado: UbicacionResultado) {
    setValue('latitud', resultado.latitud, opcionesCambio);
    setValue('longitud', resultado.longitud, opcionesCambio);
    if (resultado.direccion) setValue('direccion', resultado.direccion, opcionesCambio);
  }

  function cambiarTipo(codigo: CodigoTipoVehiculo, cambios: Partial<TipoVehiculoConfig>) {
    const indice = tipos.findIndex((tipo) => tipo.codigo === codigo);
    if (indice === -1) return;
    setValue(`tipos.${indice}`, { ...tipos[indice], ...cambios }, opcionesCambio);
  }
  async function guardar(valores: PerfilParqueaderoFormValues) {
    try {
      await guardarMutation.mutateAsync({ valores, original: perfil });
      reset(valores); // lo guardado pasa a ser la nueva base de "Cancelar"

      toast.success('Cambios guardados', {
        description: 'El perfil del parqueadero se actualizó correctamente.',
      });
    } catch (error) {
      toast.error('No se pudieron guardar los cambios', {
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      });
    }
  }

  function avisarFormularioInvalido() {
    toast.error('Revisa los campos marcados en rojo antes de guardar.');
  }

  const erroresTipos = Array.isArray(errors.tipos)
    ? Array.from(
      new Set(errors.tipos.map((t) => t?.capacidad?.message).filter((m): m is string => !!m)),
    )
    : [];

  return (
    <form onSubmit={handleSubmit(guardar, avisarFormularioInvalido)} noValidate className="w-full space-y-6">
      <header className="pb-1">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-marca-primario">
          <MapPin className="size-3.5" aria-hidden="true" />
          Perfil del parqueadero
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-neutro-900 sm:text-3xl">
          Perfil del parqueadero
        </h1>
        <p className="mt-2 text-sm text-neutro-600">
          Los datos de tu parqueadero y qué vehículos recibe.
        </p>
      </header>

      <DatosParqueaderoCard
        nombre={nombre}
        direccion={direccion}
        latitud={latitud}
        longitud={longitud}
        onNombreChange={(valor) => setValue('nombre', valor, opcionesCambio)}
        onDireccionChange={(valor) => setValue('direccion', valor, opcionesCambio)}
        onUbicacionChange={aplicarUbicacion}
        errorNombre={errors.nombre?.message}
        errorDireccion={errors.direccion?.message}
        deshabilitado={isSubmitting}
      />

      <TiposVehiculoCard
        tipos={tipos}
        onAdmiteChange={(codigo, admite) => cambiarTipo(codigo, { admite })}
        onCapacidadChange={(codigo, capacidad) => cambiarTipo(codigo, { capacidad })}
      />

      {(erroresTipos.length > 0 || guardarMutation.isError) && (
        <div role="alert" className="rounded-btn border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {erroresTipos.map((mensaje) => (
            <p key={mensaje}>{mensaje}</p>
          ))}
          {guardarMutation.isError && <p>{guardarMutation.error.message}</p>}
        </div>
      )}

      <div className="flex flex-col-reverse items-center gap-4 border-t border-neutro-300 pt-6 sm:flex-row sm:justify-between">
        <p className="text-xs text-neutro-600">Los cambios aplican solo a este parqueadero.</p>
        <div className="flex w-full gap-4 sm:w-auto">
          <button
            type="button"
            disabled={!isDirty || isSubmitting}
            onClick={() => {
              guardarMutation.reset();
              reset();
            }}
            className="w-full rounded-btn border border-neutro-300 bg-neutro-0 px-4 py-2.5 text-sm font-semibold text-neutro-900 transition-colors hover:bg-neutro-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-primario disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="w-full rounded-btn bg-marca-primario px-4 py-2.5 text-sm font-semibold text-neutro-0 shadow-card transition-colors hover:bg-marca-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-primario disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  );
}