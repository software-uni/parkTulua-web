export interface Coordenadas {
  latitud: number;
  longitud: number;
}

const MENSAJES_GEOLOCALIZACION: Record<number, string> = {
  1: 'No diste permiso para usar tu ubicación. Actívalo en el navegador e inténtalo de nuevo.',
  2: 'No se pudo determinar tu ubicación. Revisa tu conexión o el GPS.',
  3: 'Tardó demasiado en obtener la ubicación. Inténtalo de nuevo.',
};

export function obtenerPosicionActual(): Promise<Coordenadas> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Tu navegador no permite obtener la ubicación.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) =>
        resolve({ latitud: posicion.coords.latitude, longitud: posicion.coords.longitude }),
      (error) =>
        reject(new Error(MENSAJES_GEOLOCALIZACION[error.code] ?? 'No se pudo obtener la ubicación.')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

interface RespuestaNominatim {
  display_name?: string;
  address?: Record<string, string>;
  error?: string;
}

function formatearDireccion(respuesta: RespuestaNominatim): string {
  const a = respuesta.address ?? {};
  const via = [a.road, a.house_number].filter(Boolean).join(' ');
  const zona = a.neighbourhood ?? a.suburb ?? a.quarter;
  const ciudad = a.city ?? a.town ?? a.village ?? a.municipality;
  const partes = [via, zona, ciudad].filter(Boolean);
  const texto = partes.length > 0 ? partes.join(', ') : (respuesta.display_name ?? '');
  return texto.slice(0, 160); // el esquema permite hasta 160 caracteres
}

export async function direccionDesdeCoordenadas({ latitud, longitud }: Coordenadas): Promise<string> {
  const parametros = new URLSearchParams({
    format: 'jsonv2',
    lat: String(latitud),
    lon: String(longitud),
    zoom: '18',
    addressdetails: '1',
    'accept-language': 'es',
  });
  const respuesta = await fetch(`https://nominatim.openstreetmap.org/reverse?${parametros.toString()}`);
  if (!respuesta.ok) throw new Error('No se pudo consultar la dirección.');

  const datos = (await respuesta.json()) as RespuestaNominatim;
  const direccion = datos.error ? '' : formatearDireccion(datos);
  if (!direccion) throw new Error('No se encontró una dirección para ese punto.');
  return direccion;
}