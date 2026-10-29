import { useQuery } from '@tanstack/react-query';
import { obtenerParqueaderoPropioId } from '../api/parqueaderoApi';

export function useMiParqueaderoId() {
  return useQuery({
    queryKey: ['parqueadero', 'propio'],
    queryFn: obtenerParqueaderoPropioId,
  });
}