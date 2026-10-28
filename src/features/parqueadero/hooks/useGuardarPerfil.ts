import { useMutation, useQueryClient } from '@tanstack/react-query';
import { guardarPerfil } from '../api/parqueaderoApi';
import type { PerfilParqueadero, ParqueaderoApiError } from '../types/parqueadero.types';
import type { PerfilParqueaderoFormValues } from '../types/perfilParqueadero.schema';
import { claveParqueaderoPerfil } from './useParqueaderoPerfil';

interface GuardarVariables {
  valores: PerfilParqueaderoFormValues;
  original: PerfilParqueadero;
}

export function useGuardarPerfil(parqueaderoId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation<void, ParqueaderoApiError, GuardarVariables>({
    mutationFn: ({ valores, original }) => guardarPerfil(valores, original),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: claveParqueaderoPerfil(parqueaderoId ?? '') }),
  });
}