import { LoaderCircle } from 'lucide-react'

export function Splash() {
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