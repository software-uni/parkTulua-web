import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './features/auth/AuthProvider'
import LoginPage from './features/auth/LoginPage'
import { PublicOnly, RequireRole, RequireStaff } from './features/auth/RouteGuards'
import AppShell from './features/shell/AppShell'
import { ADMINISTRACION, OPERACION, ROLES_ADMINISTRACION } from './features/shell/navigation'
import PlaceholderPage from './features/shell/PlaceholderPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnly />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<RequireStaff />}>
            <Route element={<AppShell />}>
              {/* Cada PlaceholderPage se reemplaza por su pantalla real en su historia. */}
              <Route index element={<PlaceholderPage />} />
              {OPERACION.filter(({ to }) => to !== '/').map(({ to }) => (
                <Route key={to} path={to} element={<PlaceholderPage />} />
              ))}

              <Route element={<RequireRole roles={ROLES_ADMINISTRACION} />}>
                {ADMINISTRACION.map(({ to }) => (
                  <Route key={to} path={to} element={<PlaceholderPage />} />
                ))}
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
