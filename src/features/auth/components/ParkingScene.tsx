import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useCallback, type ComponentProps } from 'react'

type DotLottieInstance = Parameters<
  NonNullable<ComponentProps<typeof DotLottieReact>['dotLottieRefCallback']>
>[0]

export function ParkingScene() {
  const bindAnimation = useCallback((dotLottie: DotLottieInstance) => {
    if (!dotLottie) return
    dotLottie.addEventListener('complete', () => dotLottie.pause())
  }, [])

  return (
    <div
      className="absolute bottom-[8%] right-0 flex h-[78%] w-full items-end justify-end"
      aria-hidden="true"
    >
      <DotLottieReact
        src="/animations/intro-parqueadero.json"
        autoplay
        loop={false}
        segment={[0, 120]}
        layout={{ fit: 'contain', align: [1, 0.5] }}
        dotLottieRefCallback={bindAnimation}
        className="size-full"
      />
    </div>
  )
}
