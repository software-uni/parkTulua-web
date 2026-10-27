import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import type { Rol } from '../types/auth.types'
import { Splash } from './Splash'

/** Solo entra personal con sesión y parqueadero asignado. El resto va al login. */
export function RequireStaff() {
  const { status, access } = useAuth()
  if (status === 'loading') return <Splash />
  if (status !== 'in') return <Navigate to="/login" replace />
  // Sesión válida pero sin parqueadero: solo puede ser administrador de plataforma.
  if (!access) return <Navigate to="/plataforma" replace />
  return <Outlet />
}

/** Solo entra el administrador de plataforma. */
export function RequirePlatformAdmin() {
  const { status, esAdminPlataforma } = useAuth()
  if (status === 'loading') return <Splash />
  if (status !== 'in') return <Navigate to="/login" replace />
  if (!esAdminPlataforma) return <Navigate to="/" replace />
  return <Outlet />
}

/** El login no se muestra si ya hay sesión válida. */
export function PublicOnly() {
  const { status } = useAuth()
  if (status === 'loading') return <Splash />
  if (status === 'in') return <Navigate to="/" replace />
  return <Outlet />
}

/**
 * Restringe un grupo de rutas por rol. Es una comodidad de la interfaz:
 * la protección real de los datos la hacen las políticas RLS en Supabase.
 */
export function RequireRole({ roles }: { roles: Rol[] }) {
  const { access } = useAuth()
  if (!access || !roles.includes(access.activa.rol)) return <Navigate to="/" replace />
  return <Outlet />
}