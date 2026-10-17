import { createContext } from 'react'
import type { User } from 'firebase/auth'

// Roles de public.asignacion_parqueadero.rol
export type Rol = 'propietario' | 'operador' | 'supervisor'

export interface Asignacion {
  id: string
  rol: Rol
  parqueaderoId: string
  parqueaderoNombre: string
}

export interface Access {
  /** Todas las asignaciones activas de la persona (relación N:M con parqueadero). */
  asignaciones: Asignacion[]
  /** La que se está usando ahora. Por ahora, la primera. */
  activa: Asignacion
}

/**
 * loading  → restaurando la sesión al abrir la app
 * checking → la persona acaba de iniciar sesión y se verifica su parqueadero
 * out      → sin sesión
 * in       → sesión válida y con parqueadero asignado
 */
export type AuthStatus = 'loading' | 'checking' | 'out' | 'in'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  access: Access | null
  /** Motivo por el que se cerró la sesión tras iniciar (sin parqueadero, error al verificar). */
  accessError: string | null
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
