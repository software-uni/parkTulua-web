import { z } from 'zod'

export const crearPropietarioSchema = z.object({
  nombre: z.string().trim().min(3, 'Escribe el nombre completo'),
  correo: z.string().trim().email('Correo no válido'),
  nombreParqueadero: z.string().trim().min(3, 'Escribe el nombre del parqueadero'),
})

export type CrearPropietarioFormValues = z.infer<typeof crearPropietarioSchema>