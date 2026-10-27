import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { FirebaseError } from 'firebase/app'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth } from '../../../core/firebase/firebaseClient'
import { asegurarRol, cargarAcceso, RegistroError } from '../api/accesoApi'
import {
  MENSAJE_CORREO_SIN_VERIFICAR,
  MENSAJE_ERROR_AL_VERIFICAR,
  MENSAJE_SIN_ACCESO,
} from '../api/authErrors'
import type { Access, AuthContextValue, AuthStatus } from '../types/auth.types'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [access, setAccess] = useState<Access | null>(null)
  const [accessError, setAccessError] = useState<string | null>(null)

  // true mientras la persona inicia sesión desde el formulario. Así el login
  // sigue mostrando "Ingresando…" y no se confunde con restaurar una sesión.
  const interactivo = useRef(false)

  useEffect(() => {
    let cancelado = false

    const cancelarSuscripcion = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setAccess(null)
        setStatus('out')
        return
      }

      setStatus(interactivo.current ? 'checking' : 'loading')

      try {
        // Garantiza que el token tenga el claim `role: authenticated` antes de consultar Supabase.
        await asegurarRol(firebaseUser)
        if (cancelado) return

        const acceso = await cargarAcceso(firebaseUser.uid)
        if (cancelado) return

        if (!acceso) {
          // Tiene cuenta, pero no es personal de ningún parqueadero.
          setAccessError(MENSAJE_SIN_ACCESO)
          await firebaseSignOut(auth)
          return
        }

        setUser(firebaseUser)
        setAccess(acceso)
        setStatus('in')
      } catch (error) {
        if (cancelado) return
        console.error('No se pudo verificar el acceso', error)
        // 403 = correo sin verificar (regla de la edge function registrar-usuario)
        const sinVerificar = error instanceof RegistroError && error.status === 403
        setAccessError(sinVerificar ? MENSAJE_CORREO_SIN_VERIFICAR : MENSAJE_ERROR_AL_VERIFICAR)
        await firebaseSignOut(auth)
      } finally {
        interactivo.current = false
      }
    })

    return () => {
      cancelado = true
      cancelarSuscripcion()
    }
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAccessError(null)
    interactivo.current = true
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      interactivo.current = false
      throw error
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setAccessError(null)
    interactivo.current = true
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider)
    } catch (error) {
      interactivo.current = false
      throw error
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      // No se revela si el correo existe o no.
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') return
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, access, accessError, signInWithEmail, signInWithGoogle, resetPassword, signOut }),
    [status, user, access, accessError, signInWithEmail, signInWithGoogle, resetPassword, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}