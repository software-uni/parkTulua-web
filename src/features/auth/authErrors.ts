import { FirebaseError } from 'firebase/app'

/**
 * Traduce un error de Firebase Auth a un mensaje para la persona.
 * Devuelve null cuando no hay nada que mostrar (cerró la ventana de Google).
 */
export function mensajeDeErrorFirebase(error: unknown): string | null {
  const code = error instanceof FirebaseError ? error.code : ''

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-email':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Correo o contraseña incorrectos'
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada. Contacta al propietario del parqueadero.'
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.'
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.'
    case 'auth/account-exists-with-different-credential':
      return 'Ya existe una cuenta con ese correo que usa otro método de acceso.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null
    default:
      return 'No pudimos iniciar sesión. Inténtalo de nuevo.'
  }
}
