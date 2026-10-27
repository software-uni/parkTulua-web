import type { User } from 'firebase/auth'

export const ROLES = ['propietario', 'operador', 'supervisor'] as const
export type Rol = (typeof ROLES)[number]

export function esRol(valor: string): valor is Rol {
  return (ROLES as readonly string[]).includes(valor)
}

export interface Asignacion {
  id: string
  rol: Rol
  parqueaderoId: string
  parqueaderoNombre: string
}

export interface Access {

  asignaciones: Asignacion[]
  /** La que se está usando ahora. Por ahora, la primera. */
  activa: Asignacion
}

export type AuthStatus = 'loading' | 'checking' | 'out' | 'in'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  access: Access | null
  esAdminPlataforma: boolean
  /** Motivo por el que se cerró la sesión tras iniciar (sin parqueadero, error al verificar). */
  accessError: string | null
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
}