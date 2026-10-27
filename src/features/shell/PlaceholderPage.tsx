import { useLocation } from 'react-router'
import { tituloDe } from './navigation'

// Marcador temporal: cada pantalla real se reemplaza en su propia historia.
export default function PlaceholderPage() {
  const { pathname } = useLocation()

  return (
    <section className="flex flex-col items-center gap-2 rounded-2xl border border-[#e3e0f3] bg-white px-6 py-16 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h2 className="text-lg font-semibold text-[#1e1b3a]">{tituloDe(pathname)}</h2>
      <p className="max-w-sm text-sm text-[#6b7088]">
        Esta pantalla se construye en su propia historia. La navegación ya llega hasta aquí.
      </p>
    </section>
  )
}
