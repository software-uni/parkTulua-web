 import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, useRoutes, type RouteObject } from 'react-router'
import { AuthProvider } from './features/auth/AuthProvider'
import LoginPage from './features/auth/LoginPage'
import { PublicOnly, RequireRole, RequireStaff } from './features/auth/RouteGuards'
import AppShell from './features/shell/AppShell'
import { ADMINISTRACION, OPERACION, ROLES_ADMINISTRACION } from './features/shell/navigation'
import PlaceholderPage from './features/shell/PlaceholderPage'
import { usuariosRoutes } from './features/usuarios/routes'

const queryClient = new QueryClient()

// Usuarios viene de su propia feature (F-7). El resto son marcadores hasta su historia.
const rutasOperacion: RouteObject[] = OPERACION.filter(({ to }) => to !== '/').map(({ to }) => ({
  path: to,
  element: <PlaceholderPage />,
}))

const rutasAdministracion: RouteObject[] = [
  usuariosRoutes,
  ...ADMINISTRACION.filter(({ to }) => to !== '/usuarios').map(({ to }) => ({
    path: to,
    element: <PlaceholderPage />,
  })),
]

const rutas: RouteObject[] = [
  { element: <PublicOnly />, children: [{ path: '/login', element: <LoginPage /> }] },
  {
    element: <RequireStaff />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <PlaceholderPage /> },
          ...rutasOperacion,
          { element: <RequireRole roles={ROLES_ADMINISTRACION} />, children: rutasAdministracion },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]

function Rutas() {
  return useRoutes(rutas)
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Rutas />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}