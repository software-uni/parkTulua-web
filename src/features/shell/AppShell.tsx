import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { LoaderCircle, LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { useAuth } from '../auth/hooks/useAuth'
import { ADMINISTRACION, OPERACION, ROLES_ADMINISTRACION, type NavItem } from './navigation'

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

function Seccion({
  titulo,
  items,
  onNavigate,
  colapsado,
}: {
  titulo: string
  items: NavItem[]
  onNavigate: () => void
  colapsado: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className={`px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6b7088] ${colapsado ? 'lg:sr-only' : ''}`}>
        {titulo}
      </p>
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          title={colapsado ? label : undefined}
          aria-label={colapsado ? label : undefined}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
              colapsado ? 'lg:justify-center lg:px-0' : ''
            } ${
              isActive
                ? 'bg-[#eeebfb] text-[#5848b8]'
                : 'text-[#6b7088] hover:bg-[#f7f6fd] hover:text-[#1e1b3a]'
            }`
          }
        >
          <Icon className="size-5 shrink-0 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-110" aria-hidden="true" />
          <span className={colapsado ? 'lg:hidden' : ''}>{label}</span>
        </NavLink>
      ))}
    </div>
  )
}

export default function AppShell() {
  const { access, signOut } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [colapsado, setColapsado] = useState(false)
  const [saliendo, setSaliendo] = useState(false)
  const [errorSesion, setErrorSesion] = useState<string | null>(null)

  if (!access) return null

  const { rol, parqueaderoNombre } = access.activa
  const veAdministracion = ROLES_ADMINISTRACION.includes(rol)
  const cerrarMenu = () => setMenuAbierto(false)

  async function cerrarSesion() {
    setSaliendo(true)
    setErrorSesion(null)
    try {
      await signOut()
    } catch (error) {
      console.error('No se pudo cerrar la sesión', error)
      setErrorSesion('No se pudo cerrar la sesión. Inténtalo de nuevo.')
    } finally {
      setSaliendo(false)
    }
  }

  return (
    <div className={`min-h-screen bg-[#f7f6fd] font-sans text-[#1e1b3a] transition-[padding] duration-200 ${colapsado ? 'lg:pl-[76px]' : 'lg:pl-[254px]'}`}>
      {menuAbierto && (
        <div className="fixed inset-0 z-30 bg-[#1e1b3a]/40 lg:hidden" onClick={cerrarMenu} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[254px] flex-col border-r border-[#e3e0f3] bg-white px-4 py-6 transition-[width,transform] duration-200 ${
          colapsado ? 'lg:w-[76px]' : 'lg:w-[254px]'
        } ${menuAbierto ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className={`flex items-center justify-between px-1 ${colapsado ? 'lg:justify-center' : ''}`}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#6d5bd0] text-base font-extrabold text-white">
              P
            </div>
            <span className={`text-[17px] font-bold tracking-[-0.01em] ${colapsado ? 'lg:hidden' : ''}`}>ParkTuluá</span>
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

        <button
          type="button"
          onClick={() => setColapsado((actual) => !actual)}
          aria-label={colapsado ? 'Expandir menú' : 'Contraer menú'}
          aria-expanded={!colapsado}
          className={`mt-5 hidden items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#6b7088] transition-colors hover:bg-[#f7f6fd] hover:text-[#1e1b3a] lg:flex ${colapsado ? 'lg:justify-center lg:px-0' : ''}`}
        >
          {colapsado ? <PanelLeftOpen className="size-5 shrink-0" /> : <PanelLeftClose className="size-5 shrink-0" />}
          <span className={colapsado ? 'lg:hidden' : ''}>{colapsado ? 'Expandir menú' : 'Contraer menú'}</span>
        </button>

        <nav aria-label="Principal" className="mt-2 flex-1 overflow-y-auto">
          <Seccion titulo="Operación" items={OPERACION} onNavigate={cerrarMenu} colapsado={colapsado} />
          {veAdministracion && (
            <Seccion titulo="Administración" items={ADMINISTRACION} onNavigate={cerrarMenu} colapsado={colapsado} />
          )}
        </nav>

        {errorSesion && (
          <p role="alert" className="mb-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">
            {errorSesion}
          </p>
        )}
        <button
          type="button"
          onClick={cerrarSesion}
          disabled={saliendo}
          title={colapsado ? 'Cerrar sesión' : undefined}
          aria-label="Cerrar sesión"
          className={`group mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#6b7088] transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-60 ${
            colapsado ? 'lg:justify-center lg:px-0' : ''
          }`}
        >
          {saliendo ? (
            <LoaderCircle className="size-5 shrink-0 animate-spin" />
          ) : (
            <LogOut className="size-5 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
          )}
          <span className={colapsado ? 'lg:hidden' : ''}>{saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}</span>
        </button>

        <div className={`flex items-center gap-3 rounded-xl bg-[#f1effa] p-3 ${colapsado ? 'lg:justify-center lg:px-0' : ''}`}>
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#6d5bd0] text-xs font-semibold text-white"
            title={colapsado ? `${parqueaderoNombre} · ${ETIQUETA_ROL[rol]}` : undefined}
          >
            {iniciales(parqueaderoNombre)}
          </div>
          <div className={colapsado ? 'lg:hidden' : 'min-w-0'}>
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
      </header>

      <main className="px-4 pb-10 pt-4 sm:px-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  )
}
