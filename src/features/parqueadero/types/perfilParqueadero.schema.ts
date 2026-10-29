import { z } from 'zod';
import { TIPOS_VEHICULO, maxCuposReservables } from './parqueadero.types';

const tipoVehiculoSchema = z
  .object({
    codigo: z.enum(TIPOS_VEHICULO, { error: 'Tipo de vehículo no válido' }),
    admite: z.boolean(),
    capacidad: z
      .number({ error: 'Ingresa la capacidad' })
      .int('Debe ser un número entero')
      .min(0, 'La capacidad no puede ser negativa')
      .max(9999, 'La capacidad es demasiado alta'),
    cuposReservables: z.number().int().min(0),
    tarifaHora: z.number().min(0).nullable(),
  })
  // La base valida esto siempre, esté el tipo encendido o apagado.
  .refine((tipo) => tipo.cuposReservables <= maxCuposReservables(tipo.capacidad), {
    path: ['capacidad'],
    message: 'La capacidad no puede ser menor al doble de los cupos reservables configurados.',
  });

export const perfilParqueaderoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'Ingresa el nombre del parqueadero')
    .max(80, 'El nombre es demasiado largo'),
  direccion: z
    .string()
    .trim()
    .min(5, 'Ingresa la dirección')
    .max(160, 'La dirección es demasiado larga'),
  latitud: z.number().min(-90, 'Latitud no válida').max(90, 'Latitud no válida'),
  longitud: z.number().min(-180, 'Longitud no válida').max(180, 'Longitud no válida'),
  tipos: z.array(tipoVehiculoSchema).length(TIPOS_VEHICULO.length),
});

export type PerfilParqueaderoFormValues = z.infer<typeof perfilParqueaderoSchema>;