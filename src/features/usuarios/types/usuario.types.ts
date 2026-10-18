import type { Database } from '../../../core/types/database';

type AsignacionRow = Database['public']['Tables']['asignacion_parqueadero']['Row'];

/** Roles válidos hoy en el esquema (CHECK de asignacion_parqueadero). "Personalizado" depende de D-ER3-12 (UNI-15). */
export const ROLES_PERSONAL = ['propietario', 'operador', 'supervisor'] as const;
export type RolPersonal = (typeof ROLES_PERSONAL)[number];

/** Roles que el propietario puede asignar al crear un usuario. El propietario no se crea desde aquí. */
export const ROLES_ASIGNABLES = ['operador', 'supervisor'] as const;
export type RolAsignable = (typeof ROLES_ASIGNABLES)[number];

export const ESTADOS_ASIGNACION = ['activo', 'inactivo'] as const;
export type EstadoAsignacion = (typeof ESTADOS_ASIGNACION)[number];

export type FiltroEstado = 'todos' | EstadoAsignacion;

export interface AsignacionConUsuario {
  id: AsignacionRow['id'];
  usuarioId: string;
  parqueaderoId: string;
  rol: RolPersonal;
  estado: EstadoAsignacion;
  creadoEn: string;
  nombreCompleto: string;
  correo: string;
}

export interface ContextoAdmin {
  /** Usuario autenticado (para marcar "(tú)"). */
  usuarioId: string;
  parqueaderoId: string;
  nombreParqueadero: string;
}

export interface NuevoUsuarioInput {
  parqueaderoId: string;
  nombreCompleto: string;
  correo: string;
  rol: RolAsignable;
}

export interface NuevoUsuarioResultado {
  asignacionId: string;
  /** false si la asignación se creó pero la invitación por correo falló (se puede reintentar). */
  invitacionEnviada: boolean;
}

export const ETIQUETA_ROL: Record<RolPersonal, string> = {
  propietario: 'Propietario',
  operador: 'Operador',
  supervisor: 'Supervisor',
};

export const ETIQUETA_ESTADO: Record<EstadoAsignacion, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
};

export const DESCRIPCION_ROL: Record<RolAsignable, string> = {
  operador: 'Gestiona el día a día: reservas, servicios y retiros.',
  supervisor: 'Además consulta pagos, usuarios y perfil.',
};

export function esRolPersonal(valor: string): valor is RolPersonal {
  return (ROLES_PERSONAL as readonly string[]).includes(valor);
}

export function esEstadoAsignacion(valor: string): valor is EstadoAsignacion {
  return (ESTADOS_ASIGNACION as readonly string[]).includes(valor);
}

export type UsuariosErrorCode =
  | 'sin_parqueadero'
  | 'sin_permiso'
  | 'asignacion_duplicada'
  | 'datos_invalidos'
  | 'desconocido';

export class UsuariosApiError extends Error {
  readonly code: UsuariosErrorCode;

  constructor(code: UsuariosErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'UsuariosApiError';
    this.code = code;
  }
}