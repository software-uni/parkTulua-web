import { LoaderCircle } from 'lucide-react'

export function Splash() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-fondo-app"
      role="status"
      aria-label="Cargando"
    >
      <LoaderCircle className="size-8 animate-spin text-marca-primario" />
    </div>
  )
}