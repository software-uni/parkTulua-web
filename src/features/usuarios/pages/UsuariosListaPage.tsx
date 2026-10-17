import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Plus } from 'lucide-react';
import { EstadoVacio } from '../components/EstadoVacio';
import { FiltrosEstado } from '../components/FiltrosEstado';
import { UsuariosTabla } from '../components/UsuariosTabla';
import { useAsignaciones, useContextoAdmin } from '../hooks/useUsuarios';
import type { FiltroEstado } from '../types/usuario.types';
import { mensajeDeError } from '../../../core/lib/mensajeDeError';

interface AvisoCreacion {
  nombre: string;
  invitacionEnviada: boolean;
}

/** El estado de navegación es `unknown`: se valida antes de usarlo. */
function leerAviso(estado: unknown): AvisoCreacion | null {
  if (typeof estado !== 'object' || estado === null || !('aviso' in estado)) return null;
  const aviso = (estado as { aviso: unknown }).aviso;
  if (typeof aviso !== 'object' || aviso === null) return null;
  const { nombre, invitacionEnviada } = aviso as Partial<AvisoCreacion>;
  if (typeof nombre !== 'string' || typeof invitacionEnviada !== 'boolean') return null;
  return { nombre, invitacionEnviada };
}

export function UsuariosListaPage() {
  const location = useLocation();
  const contexto = useContextoAdmin();
  const asignaciones = useAsignaciones(contexto.data?.parqueaderoId);
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [avisoCerrado, setAvisoCerrado] = useState(false);
  const aviso = avisoCerrado ? null : leerAviso(location.state);

  const lista = asignaciones.data;
  const conteos = useMemo<Record<FiltroEstado, number>>(
    () => ({
      todos: lista?.length ?? 0,
      activo: lista?.filter((a) => a.estado === 'activo').length ?? 0,
      inactivo: lista?.filter((a) => a.estado === 'inactivo').length ?? 0,
    }),
    [lista],
  );
  const visibles = useMemo(
    () => (filtro === 'todos' ? (lista ?? []) : (lista ?? []).filter((a) => a.estado === filtro)),
    [lista, filtro],
  );

  function renderContenido() {
    if (contexto.isError) {
      return (
        <EstadoVacio
          tono="error"
          titulo="No pudimos cargar tu parqueadero"
          descripcion={mensajeDeError(contexto.error, 'Intenta de nuevo en unos segundos.')}
          accion={<BotonReintentar onClick={() => void contexto.refetch()} />}
        />
      );
    }
    if (contexto.isPending || asignaciones.isPending) {
      return <EstadoVacio titulo="Cargando usuarios…" />;
    }
    if (asignaciones.isError) {
      return (
        <EstadoVacio
          tono="error"
          titulo="No pudimos cargar la lista de usuarios"
          descripcion={mensajeDeError(asignaciones.error, 'Intenta de nuevo en unos segundos.')}
          accion={<BotonReintentar onClick={() => void asignaciones.refetch()} />}
        />
      );
    }
    if (visibles.length === 0) {
      return (
        <EstadoVacio
          titulo="No hay usuarios en este filtro"
          descripcion="Prueba con otro estado o crea un usuario nuevo."
        />
      );
    }
    return <UsuariosTabla asignaciones={visibles} usuarioActualId={contexto.data.usuarioId} />;
  }

  return (
    <section className="flex flex-col gap-6 p-8">
      <header className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutro-900">Usuarios</h1>
          <p className="mt-1 text-sm text-neutro-600">
            Administra quién maneja tu parqueadero y qué puede hacer cada uno.
          </p>
        </div>
        <Link
          to="nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-marca-primario px-5 py-[13px] text-[15px] font-semibold text-neutro-0 shadow-[0_6px_16px_-4px_rgba(110,92,209,0.28)] transition-colors hover:bg-marca-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-primario"
        >
          <Plus aria-hidden="true" className="size-[18px]" />
          Nuevo usuario
        </Link>
      </header>

      {aviso && (
        <div
          role="status"
          className={
            aviso.invitacionEnviada
              ? 'flex items-start gap-3 rounded-card bg-estado-disponible-bg px-4 py-3 text-sm text-estado-disponible-texto'
              : 'flex items-start gap-3 rounded-card bg-estado-poca-bg px-4 py-3 text-sm text-estado-poca-texto'
          }
        >
          <p className="flex-1">
            {aviso.invitacionEnviada
              ? `Creamos a ${aviso.nombre} y le enviamos la invitación por correo.`
              : `Creamos a ${aviso.nombre}, pero no pudimos enviar la invitación por correo.`}
          </p>
          <button
            type="button"
            onClick={() => setAvisoCerrado(true)}
            className="font-semibold underline underline-offset-2"
          >
            Cerrar
          </button>
        </div>
      )}

      <FiltrosEstado valor={filtro} onChange={setFiltro} conteos={conteos} />
      {renderContenido()}
    </section>
  );
}

function BotonReintentar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-btn bg-marca-claro px-4 py-2 text-sm font-semibold text-marca-primario hover:bg-marca-claro/70"
    >
      Reintentar
    </button>
  );
}