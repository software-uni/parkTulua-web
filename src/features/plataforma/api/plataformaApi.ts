import { auth } from '../../../core/firebase/firebaseClient'
import { env } from '../../../core/config/env'
import type { CrearPropietarioFormValues } from '../types/propietario.schema'

export async function crearPropietarioAPI(datos: CrearPropietarioFormValues) {
  const user = auth.currentUser
  if (!user) {
    throw new Error('No tienes sesión activa.')
  }

  const token = await user.getIdToken()

  const respuesta = await fetch(`${env.supabaseUrl}/functions/v1/crear-propietario`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}))
    throw new Error(errorData.error || 'No pudimos crear el propietario. Inténtalo de nuevo.')
  }

  return respuesta.json() as Promise<{
    ok: boolean
    creada: boolean
    parqueaderoId: string
  }>
}