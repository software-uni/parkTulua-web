import {
  CalendarDays,
  Clock,
  CreditCard,
  LayoutGrid,
  List,
  MapPin,
  QrCode,
  ShieldCheck,
  SlidersHorizontal,
  User,
  type LucideIcon,
} from 'lucide-react'
import type { Rol } from '../auth/types/auth.types'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

// Mismas secciones y orden del menú en Figma (Administrador web 2.0).
export const OPERACION: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/reservas', label: 'Reservas', icon: CalendarDays },
  { to: '/servicios', label: 'Servicios en curso', icon: Clock },
  { to: '/verificar-retiro', label: 'Verificar retiro', icon: ShieldCheck },
  { to: '/pagos', label: 'Pagos', icon: CreditCard },
]

export const ADMINISTRACION: NavItem[] = [
  { to: '/usuarios', label: 'Usuarios', icon: User },
  { to: '/perfil', label: 'Perfil del parqueadero', icon: MapPin },
  { to: '/catalogo', label: 'Catálogo de servicios', icon: List },
  { to: '/qr', label: 'QR de entrada', icon: QrCode },
  { to: '/configuracion', label: 'Configuración', icon: SlidersHorizontal },
]

// Quién ve la sección "Administración". Cámbialo aquí si el equipo define otra regla.
export const ROLES_ADMINISTRACION: Rol[] = ['propietario']

export function tituloDe(pathname: string): string {
  const items = [...OPERACION, ...ADMINISTRACION]
  const item = items.find(({ to }) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)))
  return item?.label ?? 'Park Tuluá'
}
