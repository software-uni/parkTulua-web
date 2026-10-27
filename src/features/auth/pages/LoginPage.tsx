import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, Check, Eye, EyeOff, LoaderCircle, Lock, Mail } from 'lucide-react'
import { mensajeDeErrorFirebase } from '../api/authErrors'
import { ParkingScene } from '../components/ParkingScene'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, type LoginFormValues } from '../types/login.schema'

export default function LoginPage() {
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
    'border-neutro-300 bg-neutro-0 focus-within:border-marca-primario focus-within:ring-4 focus-within:ring-marca-primario/20'
  const fieldError =
    'border-estado-lleno bg-estado-lleno-bg ring-4 ring-estado-lleno/10'

  return (
      <div className="grid min-h-screen bg-neutro-0 font-['Inter',sans-serif] lg:grid-cols-2">
        {/* Panel izquierdo (escena estática: la animación solo se ve en el intro) */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-b from-marca-oscuro to-ilustracion-morado-oscuro lg:block">
          <div className="absolute -left-[129px] -top-[166px] size-[480px] rounded-full bg-white/[0.07]" />
          <div className="absolute -bottom-[118px] left-[461px] size-[443px] rounded-full bg-admin-oscuro-3/60" />

          <div className="absolute left-14 top-14 flex items-center gap-[13.5px]">
            <div className="flex size-[46px] items-center justify-center rounded-[13.5px] bg-neutro-0 text-[24px] font-extrabold text-marca-primario">
              P
            </div>
            <span className="text-[24px] font-bold tracking-[-0.01em] text-neutro-0">Park Tuluá</span>
          </div>

          <h2 className="absolute left-14 top-[150px] max-w-[630px] text-[36px] font-bold leading-tight text-neutro-0">
            Todo tu parqueadero, de un vistazo.
          </h2>
          <p className="absolute left-14 top-[206px] mt-8 text-base font-medium text-neutro-300">
            Ocupación, reservas y retiros en un solo lugar.
          </p>

          <ParkingScene />
        </aside>

        {/* Formulario */}
        <main className="flex items-center justify-center px-4 py-10 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-full max-w-[420px] flex-col gap-6">
            {/* En móvil el panel izquierdo no se muestra, así que la marca va aquí */}
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex size-10 items-center justify-center rounded-xl bg-marca-primario text-xl font-extrabold text-neutro-0">
                P
              </div>
              <span className="text-xl font-bold tracking-[-0.01em] text-neutro-900">Park Tuluá</span>
            </div>
            <header className="flex flex-col items-start gap-2.5">
              <span className="rounded-full bg-marca-claro px-3 py-[5px] text-xs font-semibold text-marca-oscuro">
                Panel de administración
              </span>
              <h1 className="text-[32px] font-bold text-neutro-900">Bienvenido a Park Tuluá</h1>
              <p className="text-base text-neutro-600">Ingresa para administrar tu parqueadero.</p>
            </header>

            <div className="flex flex-col gap-[18px]">
              {/* Correo */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className={`text-sm font-semibold ${errors.email ? 'text-estado-lleno' : 'text-neutro-900'}`}
                >
                  Correo electrónico
                </label>
                <div className={`${fieldBase} ${errors.email ? fieldError : fieldNormal}`}>
                  <Mail className={`size-5 shrink-0 ${errors.email ? 'text-estado-lleno' : 'text-neutro-600'}`} />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@gmail.com"
                    aria-invalid={!!errors.email}
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-neutro-900 outline-none placeholder:text-gris-lila"
                    {...register('email')}
                  />
                  {emailValid && <Check className="size-5 shrink-0 text-estado-disponible" />}
                </div>
                {errors.email && (
                  <p id="password-error" className="flex items-center gap-1.5 text-[13px] font-medium text-estado-lleno">
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
                    className={`text-sm font-semibold ${errors.password ? 'text-estado-lleno' : 'text-neutro-900'}`}
                  >
                    Contraseña
                  </label>
                  <div className={`${fieldBase} ${errors.password ? fieldError : fieldNormal}`}>
                    <Lock className={`size-5 shrink-0 ${errors.password ? 'text-estado-lleno' : 'text-neutro-600'}`} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Tu contraseña"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                      className="min-w-0 flex-1 bg-transparent text-[15px] text-neutro-900 outline-none placeholder:text-gris-lila"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="shrink-0 text-neutro-600 hover:text-marca-primario"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="flex items-center gap-1.5 text-[13px] font-medium text-estado-lleno">
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
                    className="text-sm font-semibold text-marca-primario hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="animate-login-error flex items-center gap-1.5 rounded-[14px] border border-estado-lleno bg-estado-lleno-bg p-3 text-[13px] font-medium text-estado-lleno"
              >
                <CircleAlert className="size-5 shrink-0" />
                {errorMessage}
              </p>
            )}

            {info && (
              <p
                role="status"
                className="flex items-center gap-1.5 rounded-[14px] border border-estado-disponible bg-estado-disponible-bg p-3 text-[13px] font-medium text-estado-disponible-texto"
              >
                <Check className="size-5 shrink-0" />
                {info}
              </p>
            )}

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex items-center justify-center gap-2.5 rounded-[14px] bg-marca-primario px-5 py-[17px] text-base font-semibold text-neutro-0 shadow-lg shadow-marca-primario/30 transition hover:bg-marca-oscuro hover:shadow-xl hover:shadow-marca-primario/40 active:bg-marca-oscuro disabled:cursor-not-allowed disabled:bg-marca-claro disabled:shadow-none data-[loading=true]:cursor-wait data-[loading=true]:bg-marca-primario"
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

            <p className="text-center text-[13px] text-neutro-600">
              Acceso solo para administradores de parqueaderos
            </p>
          </form>
        </main>
      </div>
  )
}