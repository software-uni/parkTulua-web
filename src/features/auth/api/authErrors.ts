/** Textos que se muestran cuando se cierra la sesión justo después de iniciar. */
export const MENSAJE_SIN_ACCESO =
  'Tu cuenta no tiene acceso al panel de administración. Si eres conductor, usa la app de Park Tuluá.'
export const MENSAJE_ERROR_AL_VERIFICAR =
  'No pudimos verificar tu acceso. Revisa tu conexión e inténtalo de nuevo.'
export const MENSAJE_CORREO_SIN_VERIFICAR =
  'Debes verificar tu correo electrónico antes de ingresar. Revisa tu bandeja de entrada.'

  import { FirebaseError } from 'firebase/app'

export function mensajeDeErrorFirebase(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-credential':
        return 'El correo o la contraseña son incorrectos.'
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta de nuevo más tarde.'
      case 'auth/user-not-found':
        return 'No existe un usuario con este correo.'
      case 'auth/wrong-password':
        return 'Contraseña incorrecta.'
      default:
        return 'Ocurrió un error al iniciar sesión. Inténtalo de nuevo.'
    }
  }
  return 'Error de conexión. Revisa tu internet e inténtalo de nuevo.'
}