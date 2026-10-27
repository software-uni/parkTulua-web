import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendPasswordResetEmail } from 'firebase/auth'
import { Building2, CircleAlert, Check, LoaderCircle, LogOut, Mail, User } from 'lucide-react'

import { auth } from '../../../core/firebase/firebaseClient'
import { useAuth } from '../../auth/hooks/useAuth'
import { crearPropietarioAPI } from '../api/plataformaApi'
import { crearPropietarioSchema, type CrearPropietarioFormValues } from '../types/propietario.schema'

export default function CrearPropietarioPage() {
  const { signOut } = useAuth()
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
  const [errorSesion, setErrorSesion] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [saliendo, setSaliendo] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CrearPropietarioFormValues>({
    resolver: zodResolver(crearPropietarioSchema),
    defaultValues: { nombre: '', correo: '', nombreParqueadero: '' },
  })

  async function onSubmit(valores: CrearPropietarioFormValues) {
    setErrorGlobal(null)
    setExito(null)

    try {
      const respuesta = await crearPropietarioAPI(valores)

      let correoEnviado = true
      if (respuesta.creada) {
        try {
          await sendPasswordResetEmail(auth, valores.correo)
        } catch (error) {
          console.error('No se pudo enviar el correo para configurar la contraseña', error)
          correoEnviado = false
        }
      }

      setExito(
        correoEnviado
          ? `¡Parqueadero creado con éxito! Se ha enviado un correo a ${valores.correo} para que el propietario configure su contraseña.`
          : `Parqueadero creado, pero no se pudo enviar el correo a ${valores.correo}. Reenvía el enlace de contraseña manualmente.`,
      )
      reset()
    } catch (error) {
      setErrorGlobal(error instanceof Error ? error.message : 'Ocurrió un error inesperado al crear el propietario.')
    }
  }

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

  const fieldBase = 'flex items-center gap-3 rounded-card border-[1.5px] bg-neutro-0 p-4 transition'
  const fieldNormal = 'border-neutro-300 focus-within:border-marca-primario focus-within:ring-4 focus-within:ring-marca-primario/20'
  const fieldError = 'border-estado-lleno bg-estado-lleno-bg ring-4 ring-estado-lleno/10'

  return (
    <main className="flex min-h-screen items-center justify-center bg-fondo-app px-4 py-8 sm:px-8">
      <div className="w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="w-fit rounded-full bg-marca-claro px-3 py-[5px] text-xs font-semibold text-marca-oscuro">
            Panel de plataforma
          </span>
          <button
            type="button"
            onClick={cerrarSesion}
            disabled={saliendo}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-borde-suave bg-neutro-0 px-3.5 py-2.5 text-sm font-semibold text-neutro-700 transition hover:border-marca-primario hover:bg-marca-claro disabled:cursor-wait disabled:opacity-60"
          >
            {saliendo ? <LoaderCircle className="size-[18px] animate-spin" /> : <LogOut className="size-[18px]" />}
            <span>{saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}</span>
          </button>
        </div>

        <header className="mb-8 flex flex-col gap-3">
          <div className="flex size-12 items-center justify-center rounded-card bg-marca-claro text-marca-primario">
            <Building2 className="size-6" aria-hidden="true" />
          </div>
          <h1 className="text-[32px] font-bold text-neutro-900">Registrar propietario</h1>
          <p className="max-w-2xl text-base text-neutro-600">
            Crea un nuevo cliente y su parqueadero. El propietario recibirá un correo para configurar su contraseña.
          </p>
        </header>

        {errorSesion && (
          <p role="alert" className="mb-5 rounded-card border border-estado-lleno bg-estado-lleno-bg p-4 text-sm font-medium text-estado-lleno-texto">
            {errorSesion}
          </p>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="grid gap-6 rounded-card border border-borde-suave bg-neutro-0 p-6 shadow-card sm:grid-cols-2 sm:p-8"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="nombre" className="text-sm font-semibold text-neutro-900">Nombre completo del dueño</label>
            <div className={`${fieldBase} ${errors.nombre ? fieldError : fieldNormal}`}>
              <User className={`size-5 shrink-0 ${errors.nombre ? 'text-estado-lleno' : 'text-neutro-600'}`} aria-hidden="true" />
              <input
                id="nombre"
                type="text"
                autoComplete="name"
                placeholder="Ej. Carlos Martínez"
                aria-invalid={!!errors.nombre}
                aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                className="min-w-0 flex-1 bg-transparent text-[15px] text-neutro-900 outline-none placeholder:text-gris-lila"
                {...register('nombre')}
              />
            </div>
            {errors.nombre && (
              <p id="nombre-error" className="flex items-center gap-1.5 text-[13px] font-medium text-estado-lleno">
                <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="correo" className="text-sm font-semibold text-neutro-900">Correo electrónico</label>
            <div className={`${fieldBase} ${errors.correo ? fieldError : fieldNormal}`}>
              <Mail className={`size-5 shrink-0 ${errors.correo ? 'text-estado-lleno' : 'text-neutro-600'}`} aria-hidden="true" />
              <input
                id="correo"
                type="email"
                autoComplete="email"
                placeholder="cliente@ejemplo.com"
                aria-invalid={!!errors.correo}
                aria-describedby={errors.correo ? 'correo-error' : undefined}
                className="min-w-0 flex-1 bg-transparent text-[15px] text-neutro-900 outline-none placeholder:text-gris-lila"
                {...register('correo')}
              />
            </div>
            {errors.correo && (
              <p id="correo-error" className="flex items-center gap-1.5 text-[13px] font-medium text-estado-lleno">
                <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                {errors.correo.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="nombreParqueadero" className="text-sm font-semibold text-neutro-900">
              Nombre comercial del parqueadero
            </label>
            <div className={`${fieldBase} ${errors.nombreParqueadero ? fieldError : fieldNormal}`}>
              <Building2 className={`size-5 shrink-0 ${errors.nombreParqueadero ? 'text-estado-lleno' : 'text-neutro-600'}`} aria-hidden="true" />
              <input
                id="nombreParqueadero"
                type="text"
                autoComplete="organization"
                placeholder="Ej. Parqueadero El Centro"
                aria-invalid={!!errors.nombreParqueadero}
                aria-describedby={errors.nombreParqueadero ? 'parqueadero-error' : undefined}
                className="min-w-0 flex-1 bg-transparent text-[15px] text-neutro-900 outline-none placeholder:text-gris-lila"
                {...register('nombreParqueadero')}
              />
            </div>
            {errors.nombreParqueadero && (
              <p id="parqueadero-error" className="flex items-center gap-1.5 text-[13px] font-medium text-estado-lleno">
                <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                {errors.nombreParqueadero.message}
              </p>
            )}
          </div>

          {errorGlobal && (
            <p role="alert" className="flex items-center gap-2 rounded-card border border-estado-lleno bg-estado-lleno-bg p-4 text-[14px] font-medium text-estado-lleno-texto sm:col-span-2">
              <CircleAlert className="size-5 shrink-0" aria-hidden="true" />
              {errorGlobal}
            </p>
          )}

          {exito && (
            <p role="status" className="flex items-center gap-2 rounded-card border border-estado-disponible bg-estado-disponible-bg p-4 text-[14px] font-medium text-estado-disponible-texto sm:col-span-2">
              <Check className="size-5 shrink-0" aria-hidden="true" />
              {exito}
            </p>
          )}

          <div className="flex justify-end sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-btn bg-marca-primario px-6 py-3 text-[15px] font-semibold text-neutro-0 transition hover:bg-marca-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-primario disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
                  Creando propietario...
                </>
              ) : (
                'Crear propietario'
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
