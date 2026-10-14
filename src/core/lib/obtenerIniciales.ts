/** Iniciales para el avatar: primera letra de las dos primeras palabras ("Camilo Ospina" → "CO"). */
export function obtenerIniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primera = partes[0]?.[0] ?? '';
  const segunda = partes.length > 1 ? (partes[1]?.[0] ?? '') : '';
  return (primera + segunda).toUpperCase() || '?';
}