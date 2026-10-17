import { Lock } from 'lucide-react';
import { EstadoChip } from './EstadoChip';
import { RolChip } from './RolChip';
import { UsuarioAvatar } from './UsuarioAvatar';
import type { AsignacionConUsuario } from '../types/usuario.types';

interface Props {
  asignaciones: AsignacionConUsuario[];
  usuarioActualId: string | undefined;
}

export function UsuariosTabla({ asignaciones, usuarioActualId }: Props) {
  return (
    <div className="overflow-x-auto rounded-card border border-neutro-300 bg-neutro-0 px-6 py-2">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="text-[13px] font-medium text-neutro-600">
            <th scope="col" className="w-[330px] py-2.5 font-medium">Usuario</th>
            <th scope="col" className="w-40 py-2.5 font-medium">Rol</th>
            <th scope="col" className="w-[130px] py-2.5 font-medium">Estado</th>
            <th scope="col" className="py-2.5">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.map((asignacion) => {
            const esPropietario = asignacion.rol === 'propietario';
            const esUsuarioActual = asignacion.usuarioId === usuarioActualId;
            return (
              <tr key={asignacion.id} className="border-b border-neutro-300/70 last:border-b-0">
                <td className="py-3.5">
                  <div className="flex items-center gap-3">
                    <UsuarioAvatar nombre={asignacion.nombreCompleto} destacado={esUsuarioActual} />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[15px] font-semibold text-neutro-900">
                        <span className="truncate">{asignacion.nombreCompleto}</span>
                        {esUsuarioActual && (
                          <span className="text-[13px] font-normal text-neutro-600">(tú)</span>
                        )}
                      </p>
                      <p className="truncate text-[13px] text-neutro-600">{asignacion.correo}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5">
                  <RolChip rol={asignacion.rol} />
                </td>
                <td className="py-3.5">
                  <EstadoChip estado={asignacion.estado} />
                </td>
                <td className="py-3.5 text-right">
                  {/* «Editar permisos» no tiene diseño ni decisión todavía (P-1 / UNI-42, D-ER3-12). */}
                  {esPropietario && (
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-neutro-600">
                      <Lock aria-hidden="true" className="size-4" />
                      No se puede editar
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}