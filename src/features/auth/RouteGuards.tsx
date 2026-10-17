import { Navigate, Outlet } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import type { Rol } from './authContext'
import { useAuth } from './useAuth'

function Splash() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#f7f6fd]"
      role="status"
      aria-label="Cargando"
    >
      <LoaderCircle className="size-8 animate-spin text-[#6d5bd0]" />
    </div>
  )
}

/** Solo entra personal con sesión y parqueadero asignado. El resto va al login. */
export function RequireStaff() {
  const { status } = useAuth()
  if (status === 'loading') return <Splash />
  if (status !== 'in') return <Navigate to="/login" replace />
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
