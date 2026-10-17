/** Mensaje legible para mostrar al usuario, sin asumir el tipo del error capturado. */
export function mensajeDeError(error: unknown, mensajePorDefecto: string): string {
  if (error instanceof Error && error.message.trim() !== '') return error.message;
  return mensajePorDefecto;
}