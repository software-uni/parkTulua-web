import { cn } from '../../../core/lib/cn';
import { obtenerIniciales } from '../../../core/lib/obtenerIniciales';

interface Props {
  nombre: string;
  /** Avatar relleno (usuario actual / propietario) frente al suave del resto. */
  destacado?: boolean;
}

export function UsuarioAvatar({ nombre, destacado = false }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-chip text-sm font-bold',
        destacado ? 'bg-marca-primario text-neutro-0' : 'bg-marca-claro text-marca-primario',
      )}
    >
      {obtenerIniciales(nombre)}
    </div>
  );
}