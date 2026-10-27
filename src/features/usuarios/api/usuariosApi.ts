 import { supabase } from '../../../core/supabase/supabaseClient';
import { auth } from '../../../core/firebase/firebaseClient';
import {
  UsuariosApiError,
  esEstadoAsignacion,
  esRolPersonal,
  type AsignacionConUsuario,
  type ContextoAdmin,
  type NuevoUsuarioInput,
  type NuevoUsuarioResultado,
} from '../types/usuario.types';
import { MiembroError, crearMiembroEquipo } from './crearMiembroEquipo';

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
 * Parqueadero que administra la persona autenticada: su primera asignación activa
 * con rol propietario. Se filtra por su UID de Firebase porque la política
 * asignacion_select_equipo deja ver también las asignaciones del resto del equipo.
 */
export async function obtenerContextoAdmin(): Promise<ContextoAdmin> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new UsuariosApiError('sin_parqueadero', 'No hay una sesión activa.');
  }

  const { data, error } = await supabase
    .from('asignacion_parqueadero')
    .select('usuario_id, parqueadero_id, parqueadero ( nombre ), usuario!inner ( firebase_uid )')
    .eq('rol', 'propietario')
    .eq('estado', 'activo')
    .eq('usuario.firebase_uid', uid)
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
 * Ya no la usa `crearUsuario`; se conserva por si otra pantalla la necesita.
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
 * Agrega a la persona al parqueadero con la edge function `crear-miembro-equipo`: crea su cuenta
 * de Firebase (con el rol para Supabase), su usuario y su asignación, y le envía el correo para que
 * cree su contraseña. `invitacionEnviada` es false solo si la cuenta es nueva y el correo no salió.
 */
export async function crearUsuario(input: NuevoUsuarioInput): Promise<NuevoUsuarioResultado> {
  try {
    const resultado = await crearMiembroEquipo({
      correo: input.correo.trim().toLowerCase(),
      nombre: input.nombreCompleto.trim(),
      parqueaderoId: input.parqueaderoId,
      rol: input.rol,
    });
    // Si la cuenta ya existía no hay contraseña que crear, así que no hace falta invitación.
    return {
      asignacionId: resultado.asignacionId,
      invitacionEnviada: resultado.correoEnviado || !resultado.creada,
    };
  } catch (error) {
    if (error instanceof MiembroError) {
      switch (error.status) {
        case 403:
          throw new UsuariosApiError(
            'sin_permiso',
            'Solo el propietario puede gestionar los usuarios del parqueadero.',
            { cause: error },
          );
        case 409:
          throw new UsuariosApiError('asignacion_duplicada', error.message, { cause: error });
        case 400:
          throw new UsuariosApiError('datos_invalidos', 'Revisa los datos ingresados.', {
            cause: error,
          });
        default:
          throw new UsuariosApiError('desconocido', error.message, { cause: error });
      }
    }
    throw new UsuariosApiError('desconocido', 'No se pudo crear el usuario.', { cause: error });
  }
}