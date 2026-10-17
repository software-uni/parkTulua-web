import { supabase } from '../../../core/supabase/supabaseClient';
import {
  UsuariosApiError,
  esEstadoAsignacion,
  esRolPersonal,
  type AsignacionConUsuario,
  type ContextoAdmin,
  type NuevoUsuarioInput,
  type NuevoUsuarioResultado,
} from '../types/usuario.types';

interface PostgrestLikeError {
  code?: string;
  message: string;
}

/** Traduce errores de Postgres/PostgREST (RLS 42501, único 23505, datos 22023/23514) a errores de dominio. */
function traducirError(error: PostgrestLikeError, mensajePorDefecto: string): UsuariosApiError {
  switch (error.code) {
    case '42501':
      return new UsuariosApiError(
        'sin_permiso',
        'Solo el propietario puede gestionar los usuarios del parqueadero.',
        { cause: error },
      );
    case '23505':
      return new UsuariosApiError(
        'asignacion_duplicada',
        'Este correo ya tiene acceso a este parqueadero.',
        { cause: error },
      );
    case '22023':
    case '23514':
      return new UsuariosApiError('datos_invalidos', 'Revisa los datos ingresados.', {
        cause: error,
      });
    default:
      return new UsuariosApiError('desconocido', mensajePorDefecto, { cause: error });
  }
}

/**
 * Parqueadero que administra la persona autenticada. Se resuelve por RLS
 * (asignacion_select_propia): primera asignación activa con rol propietario.
 */
export async function obtenerContextoAdmin(): Promise<ContextoAdmin> {
  const { data, error } = await supabase
    .from('asignacion_parqueadero')
    .select('usuario_id, parqueadero_id, parqueadero ( nombre )')
    .eq('rol', 'propietario')
    .eq('estado', 'activo')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw traducirError(error, 'No se pudo cargar tu parqueadero.');
  if (!data) {
    throw new UsuariosApiError(
      'sin_parqueadero',
      'No tienes un parqueadero activo como propietario.',
    );
  }

  return {
    usuarioId: data.usuario_id,
    parqueaderoId: data.parqueadero_id,
    nombreParqueadero: data.parqueadero?.nombre ?? 'Parqueadero',
  };
}

/** Asignaciones del parqueadero (activas e inactivas), con el propietario primero. */
export async function listarAsignaciones(parqueaderoId: string): Promise<AsignacionConUsuario[]> {
  const { data, error } = await supabase
    .from('asignacion_parqueadero')
    .select('id, usuario_id, parqueadero_id, rol, estado, created_at, usuario ( nombre_completo, correo )')
    .eq('parqueadero_id', parqueaderoId)
    .order('created_at', { ascending: true });

  if (error) throw traducirError(error, 'No se pudo cargar la lista de usuarios.');

  const asignaciones: AsignacionConUsuario[] = [];
  for (const fila of data ?? []) {
    // Filas con valores fuera del CHECK del esquema se descartan en vez de romper la lista.
    if (!esRolPersonal(fila.rol) || !esEstadoAsignacion(fila.estado)) continue;
    asignaciones.push({
      id: fila.id,
      usuarioId: fila.usuario_id,
      parqueaderoId: fila.parqueadero_id,
      rol: fila.rol,
      estado: fila.estado,
      creadoEn: fila.created_at,
      nombreCompleto: fila.usuario?.nombre_completo?.trim() || 'Sin nombre',
      correo: fila.usuario?.correo ?? '',
    });
  }

  return asignaciones.sort((a, b) => {
    if (a.rol === 'propietario' && b.rol !== 'propietario') return -1;
    if (b.rol === 'propietario' && a.rol !== 'propietario') return 1;
    return a.creadoEn.localeCompare(b.creadoEn);
  });
}

/**
 * Pide al backend que envíe la invitación por correo para crear la contraseña.
 * Requiere la Edge Function `invitar-personal` (pendiente: proveedor de correo).
 */
export async function enviarInvitacion(asignacionId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('invitar-personal', {
    body: { asignacion_id: asignacionId },
  });
  if (error) {
    throw new UsuariosApiError('desconocido', 'No se pudo enviar la invitación por correo.', {
      cause: error,
    });
  }
}

/**
 * Crea la asignación (usuario + ASIGNACION_PARQUEADERO) en una sola operación atómica y luego envía la invitación.
 * Si la invitación falla, la asignación queda creada y se reporta `invitacionEnviada: false`.
 */
export async function crearUsuario(input: NuevoUsuarioInput): Promise<NuevoUsuarioResultado> {
  const { data: asignacionId, error } = await supabase.rpc('crear_asignacion_personal', {
    p_parqueadero_id: input.parqueaderoId,
    p_nombre_completo: input.nombreCompleto.trim(),
    p_correo: input.correo.trim().toLowerCase(),
    p_rol: input.rol,
  });

  if (error) throw traducirError(error, 'No se pudo crear el usuario.');
  if (!asignacionId) {
    throw new UsuariosApiError('desconocido', 'No se pudo crear el usuario.');
  }

  try {
    await enviarInvitacion(asignacionId);
    return { asignacionId, invitacionEnviada: true };
  } catch (errorInvitacion) {
    console.error('[usuarios] La invitación no se pudo enviar', errorInvitacion);
    return { asignacionId, invitacionEnviada: false };
  }
}