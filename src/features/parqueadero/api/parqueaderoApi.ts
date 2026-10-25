import { supabase } from '../../../core/supabase/supabaseClient';
import {
  ETIQUETA_TIPO_VEHICULO,
  ParqueaderoApiError,
  TIPOS_VEHICULO,
  esCodigoTipoVehiculo,
  type CodigoTipoVehiculo,
  type PerfilParqueadero,
  type TipoVehiculoConfig,
} from '../types/parqueadero.types';
import type { PerfilParqueaderoFormValues } from '../types/perfilParqueadero.schema';

interface PostgrestLikeError {
  code?: string;
  message: string;
}

/** Traduce errores de Postgres/PostgREST (28000, 42501, P0002, 23514, 22023) a errores de dominio. */
function traducirError(error: PostgrestLikeError, mensajePorDefecto: string): ParqueaderoApiError {
  switch (error.code) {
    case '28000':
      return new ParqueaderoApiError('no_autenticado', 'Tu sesión expiró. Inicia sesión de nuevo.', {
        cause: error,
      });
    case '42501':
      return new ParqueaderoApiError(
        'sin_permiso',
        'Solo el propietario puede editar el perfil del parqueadero.',
        { cause: error },
      );
    case 'P0002':
      return new ParqueaderoApiError('no_encontrado', 'No se encontró el parqueadero.', {
        cause: error,
      });
    case '23514':
      // Los RAISE de configurar_tipo_parqueadero traen un mensaje pensado para la persona;
      // los CHECK de las tablas traen texto técnico, que no se muestra.
      if (error.message.includes('check constraint')) {
        return new ParqueaderoApiError('datos_invalidos', 'Revisa los datos ingresados.', {
          cause: error,
        });
      }
      return new ParqueaderoApiError('capacidad_invalida', error.message, { cause: error });
    case '22023':
      return new ParqueaderoApiError('datos_invalidos', 'Revisa los datos ingresados.', {
        cause: error,
      });
    default:
      return new ParqueaderoApiError('desconocido', mensajePorDefecto, { cause: error });
  }
}


export async function obtenerPerfil(parqueaderoId: string): Promise<PerfilParqueadero> {
  const [parqueadero, tipos] = await Promise.all([
    supabase
      .from('parqueadero')
      .select('id, nombre, direccion, latitud, longitud')
      .eq('id', parqueaderoId)
      .maybeSingle(),
    supabase
      .from('parqueadero_tipo_vehiculo')
      .select('capacidad, cupos_reservables, activo, tarifa_hora, tipo_vehiculo ( codigo )')
      .eq('parqueadero_id', parqueaderoId),
  ]);

  if (parqueadero.error) throw traducirError(parqueadero.error, 'No se pudo cargar el parqueadero.');
  if (tipos.error) throw traducirError(tipos.error, 'No se pudo cargar los tipos de vehículo.');
  if (!parqueadero.data) {
    throw new ParqueaderoApiError('no_encontrado', 'No se encontró el parqueadero.');
  }

  const configuracionPorTipo = new Map<CodigoTipoVehiculo, TipoVehiculoConfig>();
  for (const fila of tipos.data ?? []) {
    const codigo = fila.tipo_vehiculo?.codigo;
    if (!codigo || !esCodigoTipoVehiculo(codigo)) continue;
    configuracionPorTipo.set(codigo, {
      codigo,
      admite: fila.activo,
      capacidad: fila.capacidad,
      cuposReservables: fila.cupos_reservables,
      tarifaHora: fila.tarifa_hora === null ? null : Number(fila.tarifa_hora),
    });
  }

  return {
    parqueaderoId: parqueadero.data.id,
    nombre: parqueadero.data.nombre,
    direccion: parqueadero.data.direccion,
    latitud: Number(parqueadero.data.latitud),
    longitud: Number(parqueadero.data.longitud),
    tipos: TIPOS_VEHICULO.map(
      (codigo) =>
        configuracionPorTipo.get(codigo) ?? {
          codigo,
          admite: false,
          capacidad: 0,
          cuposReservables: 0,
          tarifaHora: null,
        },
    ),
  };
}

async function configurarTipo(parqueaderoId: string, tipo: TipoVehiculoConfig): Promise<void> {
  const { error } = await supabase.rpc('configurar_tipo_parqueadero', {
    p_parqueadero_id: parqueaderoId,
    p_tipo_codigo: tipo.codigo,
    p_capacidad: tipo.capacidad,
    p_cupos_reservables: tipo.cuposReservables,
    p_activo: tipo.admite,
    p_tarifa_hora: tipo.tarifaHora ?? undefined,
  });
  if (error) throw error;
}


export async function guardarPerfil(
  valores: PerfilParqueaderoFormValues,
  original: PerfilParqueadero,
): Promise<void> {
  const datosCambiaron =
    valores.nombre !== original.nombre ||
    valores.direccion !== original.direccion ||
    valores.latitud !== original.latitud ||
    valores.longitud !== original.longitud;

  if (datosCambiaron) {
    const { error } = await supabase.rpc('actualizar_parqueadero', {
      p_parqueadero_id: original.parqueaderoId,
      p_nombre: valores.nombre.trim(),
      p_direccion: valores.direccion.trim(),
      p_latitud: valores.latitud,
      p_longitud: valores.longitud,
    });
    if (error) throw traducirError(error, 'No se pudieron guardar los datos del parqueadero.');
  }

  const modificados = valores.tipos.filter((tipo) => {
    const anterior = original.tipos.find((t) => t.codigo === tipo.codigo);
    return !anterior || anterior.admite !== tipo.admite || anterior.capacidad !== tipo.capacidad;
  });

  const resultados = await Promise.allSettled(
    modificados.map((tipo) => configurarTipo(original.parqueaderoId, tipo)),
  );

  const fallidos = resultados.flatMap((resultado, indice) =>
    resultado.status === 'rejected' ? [{ tipo: modificados[indice], motivo: resultado.reason }] : [],
  );
  if (fallidos.length === 0) return;

  const nombres = fallidos.map((f) => ETIQUETA_TIPO_VEHICULO[f.tipo.codigo]).join(', ');
  const primero = traducirError(fallidos[0].motivo, 'No se pudo guardar.');
  throw new ParqueaderoApiError(primero.code, `No se guardaron: ${nombres}. ${primero.message}`, {
    cause: fallidos[0].motivo,
  });
}