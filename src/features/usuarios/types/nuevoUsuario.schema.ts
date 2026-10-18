import { z } from 'zod';
import { ROLES_ASIGNABLES } from './usuario.types';

export const nuevoUsuarioSchema = z.object({
  nombreCompleto: z
    .string()
    .trim()
    .min(3, 'Ingresa el nombre completo')
    .max(120, 'El nombre es demasiado largo'),
  correo: z
    .string()
    .trim()
    .min(1, 'El correo es obligatorio')
    .pipe(z.email('Ingresa un correo válido')),
  rol: z.enum(ROLES_ASIGNABLES, { error: 'Elige un rol' }),
});

export type NuevoUsuarioFormValues = z.infer<typeof nuevoUsuarioSchema>;