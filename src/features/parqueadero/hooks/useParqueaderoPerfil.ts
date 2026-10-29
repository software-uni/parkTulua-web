import { useQuery } from '@tanstack/react-query';
import { obtenerPerfil } from '../api/parqueaderoApi';

export const claveParqueaderoPerfil = (parqueaderoId: string) =>
  ['parqueadero', 'perfil', parqueaderoId] as const;

export function useParqueaderoPerfil(parqueaderoId: string | undefined) {
  return useQuery({
    queryKey: claveParqueaderoPerfil(parqueaderoId ?? ''),
    queryFn: () => obtenerPerfil(parqueaderoId as string),
    enabled: Boolean(parqueaderoId),
  });
}