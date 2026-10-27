import type { User } from 'firebase/auth'
import { env } from '../../../core/config/env'
import { supabase } from '../../../core/supabase/supabaseClient'
import { esRol, type Access, type Asignacion } from '../types/auth.types'

interface ParqueaderoRow {
  id: string
  nombre: string
}

interface AsignacionRow {
  id: string
  rol: string
  parqueadero_id: string
  parqueadero: ParqueaderoRow | ParqueaderoRow[] | null
}

export class RegistroError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`registrar-usuario ${status}`)
    this.name = 'RegistroError'
    this.status = status
  }
}


export async function asegurarRol(firebaseUser: User): Promise<void> {
  const resultado = await firebaseUser.getIdTokenResult()
  if (resultado.claims.role === 'authenticated') return

  const respuesta = await fetch(`${env.supabaseUrl}/functions/v1/registrar-usuario`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${resultado.token}` },
  })
  if (!respuesta.ok) throw new RegistroError(respuesta.status)

  await firebaseUser.getIdToken(true) // token nuevo, ya con el claim
}



export async function cargarAcceso(firebaseUid: string): Promise<Access | null> {
  const { data, error } = await supabase
    .from('asignacion_parqueadero')
    .select('id, rol, parqueadero_id, parqueadero(id, nombre), usuario!inner(firebase_uid)')
    .eq('estado', 'activo')
    .eq('usuario.firebase_uid', firebaseUid)
    .order('created_at', { ascending: true })

  if (error) throw error

  const filas = (data ?? []) as unknown as AsignacionRow[]
  const asignaciones = filas.flatMap((fila): Asignacion[] => {
    // Un rol fuera de los conocidos se descarta en vez de entrar al estado como si fuera válido.
    if (!esRol(fila.rol)) return []
    const parqueadero = Array.isArray(fila.parqueadero) ? fila.parqueadero[0] : fila.parqueadero
    if (!parqueadero) return []
    return [
      {
        id: fila.id,
        rol: fila.rol,
        parqueaderoId: fila.parqueadero_id,
        parqueaderoNombre: parqueadero.nombre,
      },
    ]
  })

  const activa = asignaciones[0]
  return activa ? { asignaciones, activa } : null
}
export async function esAdministradorPlataforma(): Promise<boolean> {
  const { data, error } = await supabase.rpc('es_administrador_plataforma')
  if (error) throw error
  return data === true
}