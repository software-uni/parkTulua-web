import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, Check, Eye, EyeOff, LoaderCircle, Lock, Mail } from 'lucide-react'
import { mensajeDeErrorFirebase } from '../api/authErrors'
import { LoginIntro } from '../components/LoginIntro'
import { ParkingScene } from '../components/ParkingScene'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, type LoginFormValues } from '../types/login.schema'

type Phase = 'intro' | 'leaving' | 'login'

const INTRO_SEEN_KEY = 'parktulua:intro-seen'
const FADE_MS = 600

// El intro se muestra una vez por sesión y se omite si el usuario prefiere menos movimiento.
function shouldPlayIntro() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return sessionStorage.getItem(INTRO_SEEN_KEY) !== '1'
  } catch {
    return true
  }
}

export default function LoginPage() {
  const [phase, setPhase] = useState<Phase>(() => (shouldPlayIntro() ? 'intro' : 'login'))
  const phaseRef = useRef(phase)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const finishIntro = useCallback(() => {
    if (phaseRef.current !== 'intro') return
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1')
    } catch {
      /* sin storage: el intro simplemente se repetirá */
    }
    setPhase('leaving')
    window.setTimeout(() => setPhase('login'), FADE_MS)
  }, [])

  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  
  // Aquí recuperamos las funciones del contexto de autenticación
  const { status, accessError, signInWithEmail, resetPassword } = useAuth()
  const verifying = status === 'checking'

  const {
    register,
    handleSubmit,
    control,
    trigger,
    getValues,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  const emailActual = useWatch({ control, name: 'email' })
  const emailValid = !errors.email && touchedFields.email && emailActual.length > 0

  async function onSubmit(values: LoginFormValues) {
    setAuthError(null)
    setInfo(null)
    try {
      await signInWithEmail(values.email, values.password)
    } catch (error) {
      setAuthError(mensajeDeErrorFirebase(error))
    }
  }

  async function onForgot() {
    setAuthError(null)
    setInfo(null)
    if (!(await trigger('email'))) return
    try {
      await resetPassword(getValues('email'))
      setInfo('Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.')
    } catch (error) {
      setAuthError(mensajeDeErrorFirebase(error) ?? 'No pudimos enviar el correo. Inténtalo de nuevo.')
    }
  }

  // Lógica de carga simplificada sin Google
  const submitLoading = isSubmitting || verifying
  const errorMessage = authError ?? accessError

  const fieldBase =
    'flex items-center gap-3 rounded-[14px] border-[1.5px] p-4 transition-shadow'
  const fieldNormal =
    'border-[#d9d5ee] bg-white focus-within:border-[#6d5bd0] focus-within:shadow-[0_0_0_4px_rgba(109,91,208,0.18)]'
  const fieldError =
    'border-[#dc2626] bg-[#fffbfb] shadow-[0_0_0_4px_rgba(220,38,38,0.1)]'

  const introVisible = phase !== 'login'

  return (
    <>
      {introVisible && (
        <LoginIntro leaving={phase === 'leaving'} fadeMs={FADE_MS} onFinish={finishIntro} />
      )}

      <div
        className={`grid min-h-screen bg-white font-['Inter',sans-serif] transition-opacity ease-out lg:grid-cols-2 ${
          phase === 'intro' ? 'invisible opacity-0' : 'opacity-100'
        }`}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      >
        {/* Panel izquierdo (escena estática: la animación solo se ve en el intro) */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-b from-[#5848b8] to-[#2f2475] lg:block">
          <div className="absolute -left-[129px] -top-[166px] size-[480px] rounded-full bg-white/[0.07]" />
          <div className="absolute -bottom-[118px] left-[461px] size-[443px] rounded-full bg-[#2f4a8f]/60" />

          <div className="absolute left-14 top-14 flex items-center gap-[13.5px]">
            <div className="flex size-[46px] items-center justify-center rounded-[13.5px] bg-white text-[24px] font-extrabold text-[#6d5bd0]">
              P
            </div>
            <span className="text-[24px] font-bold tracking-[-0.01em] text-white">Park Tuluá</span>
          </div>

          <h2 className="absolute left-14 top-[150px] max-w-[630px] text-[36px] font-bold leading-tight text-white">
            Todo tu parqueadero, de un vistazo.
          </h2>
          <p className="absolute left-14 top-[206px] mt-8 text-base font-medium text-[#d9d5ee]">
            Ocupación, reservas y retiros en un solo lugar.
          </p>

          <ParkingScene />
        </aside>

        {/* Formulario */}
        <main className="flex items-center justify-center px-4 py-10 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-full max-w-[420px] flex-col gap-6">
            {/* En móvil el panel izquierdo no se muestra, así que la marca va aquí */}
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#6d5bd0] text-xl font-extrabold text-white">
                P
              </div>
              <span className="text-xl font-bold tracking-[-0.01em] text-[#1e1b3a]">Park Tuluá</span>
            </div>
            <header className="flex flex-col items-start gap-2.5">
              <span className="rounded-full bg-[#eeebfb] px-3 py-[5px] text-xs font-semibold text-[#5848b8]">
                Panel de administración
              </span>
              <h1 className="text-[32px] font-bold text-[#1e1b3a]">Bienvenido a Park Tuluá</h1>
              <p className="text-base text-[#6b7088]">Ingresa para administrar tu parqueadero.</p>
            </header>

            <div className="flex flex-col gap-[18px]">
              {/* Correo */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className={`text-sm font-semibold ${errors.email ? 'text-[#dc2626]' : 'text-[#1e1b3a]'}`}
                >
                  Correo electrónico
                </label>
                <div className={`${fieldBase} ${errors.email ? fieldError : fieldNormal}`}>
                  <Mail className={`size-5 shrink-0 ${errors.email ? 'text-[#dc2626]' : 'text-[#6b7088]'}`} />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@parqueadero.com"
                    aria-invalid={!!errors.email}
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1e1b3a] outline-none placeholder:text-[#a3a1b8]"
                    {...register('email')}
                  />
                  {emailValid && <Check className="size-5 shrink-0 text-[#22a06b]" />}
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#dc2626]">
                    <CircleAlert className="size-5 shrink-0" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="password"
                    className={`text-sm font-semibold ${errors.password ? 'text-[#dc2626]' : 'text-[#1e1b3a]'}`}
                  >
                    Contraseña
                  </label>
                  <div className={`${fieldBase} ${errors.password ? fieldError : fieldNormal}`}>
                    <Lock className={`size-5 shrink-0 ${errors.password ? 'text-[#dc2626]' : 'text-[#6b7088]'}`} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      aria-invalid={!!errors.password}
                      className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1e1b3a] outline-none placeholder:text-[#a3a1b8]"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="shrink-0 text-[#6b7088] hover:text-[#6d5bd0]"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#dc2626]">
                      <CircleAlert className="size-5 shrink-0" />
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onForgot}
                    disabled={submitLoading}
                    className="text-sm font-semibold text-[#6d5bd0] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="flex items-center gap-1.5 rounded-[14px] border border-[#dc2626] bg-[#fffbfb] p-3 text-[13px] font-medium text-[#dc2626]"
              >
                <CircleAlert className="size-5 shrink-0" />
                {errorMessage}
              </p>
            )}

            {info && (
              <p
                role="status"
                className="flex items-center gap-1.5 rounded-[14px] border border-[#2fa67c] bg-[#e4f5ee] p-3 text-[13px] font-medium text-[#1f7a5c]"
              >
                <Check className="size-5 shrink-0" />
                {info}
              </p>
            )}

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex items-center justify-center gap-2.5 rounded-[14px] bg-[#6d5bd0] px-5 py-[17px] text-base font-semibold text-white shadow-[0_8px_20px_-6px_rgba(110,92,209,0.28)] transition hover:bg-[#5f4ec2] hover:shadow-[0_8px_26px_-6px_rgba(110,92,209,0.36)] active:bg-[#5444b0] disabled:cursor-not-allowed disabled:bg-[#cfc9ee] disabled:shadow-none data-[loading=true]:cursor-wait data-[loading=true]:bg-[#6d5bd0]"
                data-loading={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <LoaderCircle className="size-[18px] animate-spin" />
                    Ingresando…
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </div>

            <p className="text-center text-[13px] text-[#6b7088]">
              Acceso solo para administradores de parqueaderos
            </p>
          </form>
        </main>
      </div>
    </>
  )
}