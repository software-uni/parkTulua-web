import { useCallback, useEffect, type ComponentProps } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

type DotLottieInstance = Parameters<
  NonNullable<ComponentProps<typeof DotLottieReact>['dotLottieRefCallback']>
>[0]

// Red de seguridad: si la animación nunca avisa que terminó, se entra al login igual.
const INTRO_MAX_MS = 15000

interface LoginIntroProps {
  /** true mientras se desvanece, antes de mostrar el formulario. */
  leaving: boolean
  fadeMs: number
  onFinish: () => void
}

export function LoginIntro({ leaving, fadeMs, onFinish }: LoginIntroProps) {
  useEffect(() => {
    if (leaving) return
    const t = window.setTimeout(onFinish, INTRO_MAX_MS)
    return () => window.clearTimeout(t)
  }, [leaving, onFinish])

  const bindIntro = useCallback(
    (dotLottie: DotLottieInstance) => {
      if (!dotLottie) return
      dotLottie.addEventListener('complete', onFinish)
      dotLottie.addEventListener('loadError', onFinish)
    },
    [onFinish],
  )

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#2f2475] transition-opacity ease-out ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${fadeMs}ms` }}
      role="dialog"
      aria-label="Park Tuluá"
    >
      {/* Contenedor a pantalla completa */}
      <div className="absolute inset-0 size-full">
        <DotLottieReact
          src="/animations/intro-parqueadero.json"
          autoplay
          loop={false}
          layout={{ fit: 'contain', align: [0.5, 0.5] }}
          dotLottieRefCallback={bindIntro}
          className="size-full"
        />
      </div>

      <button
        type="button"
        onClick={onFinish}
        className="absolute bottom-8 right-8 z-10 rounded-full px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        Saltar
      </button>
    </div>
  )
}