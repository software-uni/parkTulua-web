import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crearUsuario, listarAsignaciones, obtenerContextoAdmin } from '../api/usuariosApi';
import { UsuariosApiError, type NuevoUsuarioInput } from '../types/usuario.types';

export const usuariosKeys = {
  contexto: ['usuarios', 'contexto'] as const,
  asignaciones: (parqueaderoId: string) => ['usuarios', 'asignaciones', parqueaderoId] as const,
};

/** No reintenta errores que no se resuelven reintentando (sin permiso / sin parqueadero). */
function reintentar(intentos: number, error: unknown): boolean {
  if (
    error instanceof UsuariosApiError &&
    (error.code === 'sin_permiso' || error.code === 'sin_parqueadero')
  ) {
    return false;
  }
  return intentos < 2;
}

export function useContextoAdmin() {
  return useQuery({
    queryKey: usuariosKeys.contexto,
    queryFn: obtenerContextoAdmin,
    staleTime: 5 * 60 * 1000,
    retry: reintentar,
  });
}

export function useAsignaciones(parqueaderoId: string | undefined) {
  return useQuery({
    queryKey: usuariosKeys.asignaciones(parqueaderoId ?? ''),
    queryFn: () => listarAsignaciones(parqueaderoId as string),
    enabled: Boolean(parqueaderoId),
    retry: reintentar,
  });
}

export function useCrearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NuevoUsuarioInput) => crearUsuario(input),
    onSuccess: (_resultado, input) =>
      queryClient.invalidateQueries({ queryKey: usuariosKeys.asignaciones(input.parqueaderoId) }),
  });
}