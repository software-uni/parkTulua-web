import { useState } from 'react'
import { NavLink, Outlet} from 'react-router'
import { LoaderCircle, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { ADMINISTRACION, OPERACION, ROLES_ADMINISTRACION,type NavItem } from './navigation'

const ETIQUETA_ROL = {
  propietario: 'Propietario',
  operador: 'Operador',
  supervisor: 'Supervisor',
} as const

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join('')
}

function Seccion({ titulo, items, onNavigate }: { titulo: string; items: NavItem[]; onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6b7088]">
        {titulo}
      </p>
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
              isActive
                ? 'bg-[#eeebfb] text-[#5848b8]'
                : 'text-[#6b7088] hover:bg-[#f7f6fd] hover:text-[#1e1b3a]'
            }`
          }
        >
          <Icon className="size-5 shrink-0" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </div>
  )
}

export default function AppShell() {
  const { access, signOut } = useAuth()
//const { pathname } = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [saliendo, setSaliendo] = useState(false)

  // RequireStaff garantiza que hay acceso; esto solo satisface a TypeScript.
  if (!access) return null

  const { rol, parqueaderoNombre } = access.activa
  const veAdministracion = ROLES_ADMINISTRACION.includes(rol)
  const cerrarMenu = () => setMenuAbierto(false)

  async function cerrarSesion() {
    setSaliendo(true)
    try {
      await signOut()
    } finally {
      setSaliendo(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6fd] font-sans text-[#1e1b3a] lg:pl-[254px]">
      {/* Fondo oscuro del menú en móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-30 bg-[#1e1b3a]/40 lg:hidden" onClick={cerrarMenu} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[254px] flex-col border-r border-[#e3e0f3] bg-white px-4 py-6 transition-transform duration-200 lg:translate-x-0 ${
          menuAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#6d5bd0] text-base font-extrabold text-white">
              P
            </div>
            <span className="text-[17px] font-bold tracking-[-0.01em]">ParkTuluá</span>
          </div>
          <button
            type="button"
            onClick={cerrarMenu}
            aria-label="Cerrar menú"
            className="rounded-lg p-1.5 text-[#6b7088] hover:bg-[#f7f6fd] lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav aria-label="Principal" className="mt-2 flex-1 overflow-y-auto">
          <Seccion titulo="Operación" items={OPERACION} onNavigate={cerrarMenu} />
          {veAdministracion && <Seccion titulo="Administración" items={ADMINISTRACION} onNavigate={cerrarMenu} />}
        </nav>

        <div className="flex items-center gap-3 rounded-xl bg-[#f1effa] p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#6d5bd0] text-xs font-semibold text-white">
            {iniciales(parqueaderoNombre)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{parqueaderoNombre}</p>
            <p className="text-xs text-[#6b7088]">{ETIQUETA_ROL[rol]}</p>
          </div>
        </div>
      </aside>

       <header className="flex items-center justify-between gap-4 px-4 pt-6 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            className="rounded-lg border border-[#e3e0f3] bg-white p-2 text-[#1e1b3a] lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <p className="text-sm font-medium text-[#6b7088]">{parqueaderoNombre}</p>
        </div>

        <button
          type="button"
          onClick={cerrarSesion}
          disabled={saliendo}
          className="flex items-center gap-2 rounded-xl border border-[#d9d5ee] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#1e1b3a] transition hover:border-[#c5beea] hover:bg-[#f7f6fd] disabled:cursor-wait disabled:opacity-60"
        >
          {saliendo ? <LoaderCircle className="size-[18px] animate-spin" /> : <LogOut className="size-[18px]" />}
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </header>

      

      <main className="px-4 pb-10 pt-4 sm:px-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  )
}
