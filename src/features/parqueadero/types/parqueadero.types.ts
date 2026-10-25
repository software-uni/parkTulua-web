import type { Database } from '../../../core/types/database';

type ParqueaderoRow = Database['public']['Tables']['parqueadero']['Row'];

/** Tipos de vehículo del catálogo hoy (tipo_vehiculo.codigo). Tipos nuevos (por ejemplo camioneta) dependen de D-36. */
export const TIPOS_VEHICULO = ['automovil', 'motocicleta', 'bicicleta'] as const;
export type CodigoTipoVehiculo = (typeof TIPOS_VEHICULO)[number];

export const ETIQUETA_TIPO_VEHICULO: Record<CodigoTipoVehiculo, string> = {
  automovil: 'Automóvil',
  motocicleta: 'Motocicleta',
  bicicleta: 'Bicicleta',
};

/** Tope que impone configurar_tipo_parqueadero: cupos reservables ≤ 50 % de la capacidad. */
export const MAX_PORCENTAJE_CUPOS_RESERVABLES = 0.5;

export function maxCuposReservables(capacidad: number): number {
  return Math.floor(capacidad * MAX_PORCENTAJE_CUPOS_RESERVABLES);
}

export function esCodigoTipoVehiculo(valor: string): valor is CodigoTipoVehiculo {
  return (TIPOS_VEHICULO as readonly string[]).includes(valor);
}

export interface TipoVehiculoConfig {
  codigo: CodigoTipoVehiculo;
  /** Equivale a parqueadero_tipo_vehiculo.activo. */
  admite: boolean;
  capacidad: number;
  /** No se edita en esta pantalla, pero la RPC lo exige: se conserva el valor guardado. */
  cuposReservables: number;
  /** No se edita en esta pantalla, pero la RPC lo sobrescribe: se conserva el valor guardado. */
  tarifaHora: number | null;
}

export interface PerfilParqueadero {
  parqueaderoId: ParqueaderoRow['id'];
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  tipos: TipoVehiculoConfig[];
}

export type ParqueaderoErrorCode =
  | 'no_autenticado'
  | 'sin_permiso'
  | 'no_encontrado'
  | 'capacidad_invalida'
  | 'datos_invalidos'
  | 'desconocido';

export class ParqueaderoApiError extends Error {
  readonly code: ParqueaderoErrorCode;

  constructor(code: ParqueaderoErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ParqueaderoApiError';
    this.code = code;
  }
}