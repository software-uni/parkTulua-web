 import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../../core/firebase/firebaseClient'
import { env } from '../../../core/config/env'

export interface NuevoMiembro {
  correo: string
  nombre: string
  parqueaderoId: string
  /** El servidor solo acepta 'operador' o 'supervisor'; cualquier otro valor se rechaza. */
  rol: string
}

export interface ResultadoMiembro {
  /** true si se creó una cuenta nueva (la persona debe crear su contraseña con el correo). */
  creada: boolean
  /** true si se envió el correo para crear la contraseña. */
  correoEnviado: boolean
  asignacionId: string
}

/** Error de la edge function `crear-miembro-equipo`. `status` es el código HTTP (0 = sin conexión). */
export class MiembroError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * Agrega a una persona al personal de un parqueadero llamando a la edge function
 * `crear-miembro-equipo`, que crea su cuenta de Firebase, su usuario y su asignación.
 * Si la cuenta es nueva, le envía el correo para que cree su propia contraseña.
 */
export async function crearMiembroEquipo(miembro: NuevoMiembro): Promise<ResultadoMiembro> {
  const usuario = auth.currentUser
  if (!usuario) throw new MiembroError(401, 'Tu sesión expiró. Inicia sesión de nuevo.')

  const token = await usuario.getIdToken()

  let respuesta: Response
  try {
    respuesta = await fetch(`${env.supabaseUrl}/functions/v1/crear-miembro-equipo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(miembro),
    })
  } catch {
    throw new MiembroError(0, 'No pudimos conectar con el servidor. Revisa tu conexión.')
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    throw new MiembroError(
      respuesta.status,
      datos.error ?? 'No pudimos agregar a la persona. Inténtalo de nuevo.',
    )
  }

  // La persona ya quedó creada. Si es cuenta nueva, se le envía el enlace para crear su contraseña.
  let correoEnviado = false
  if (datos.creada) {
    try {
      await sendPasswordResetEmail(auth, miembro.correo)
      correoEnviado = true
    } catch (error) {
      console.error('No se pudo enviar el correo de contraseña', error)
    }
  }

  return { creada: datos.creada, correoEnviado, asignacionId: datos.asignacionId }
}