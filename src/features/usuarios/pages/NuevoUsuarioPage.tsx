import { useId, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Mail, User } from 'lucide-react';
import { cn } from '../../../core/lib/cn';
import { RolSelector } from '../components/RolSelector';
import { useContextoAdmin, useCrearUsuario } from '../hooks/useUsuarios';
import { nuevoUsuarioSchema, type NuevoUsuarioFormValues } from '../types/nuevoUsuario.schema';
import { UsuariosApiError } from '../types/usuario.types';
import { mensajeDeError } from '../../../core/lib/mensajeDeError';

export function NuevoUsuarioPage() {
  const navigate = useNavigate();
  const contexto = useContextoAdmin();
  const crear = useCrearUsuario();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NuevoUsuarioFormValues>({
    resolver: zodResolver(nuevoUsuarioSchema),
    defaultValues: { nombreCompleto: '', correo: '', rol: 'operador' },
  });

  const onSubmit = handleSubmit(async (valores) => {
    if (!contexto.data) return;
    setErrorGeneral(null);
    try {
      const resultado = await crear.mutateAsync({
        parqueaderoId: contexto.data.parqueaderoId,
        ...valores,
      });
      navigate('..', {
        state: {
          aviso: { nombre: valores.nombreCompleto, invitacionEnviada: resultado.invitacionEnviada },
        },
      });
    } catch (error) {
      if (error instanceof UsuariosApiError && error.code === 'asignacion_duplicada') {
        setError('correo', { message: error.message });
        return;
      }
      setErrorGeneral(
        error instanceof UsuariosApiError ? error.message : 'No se pudo crear el usuario.',
      );
    }
  });

  const ocupado = isSubmitting || crear.isPending;

  return (
    <section className="flex flex-col gap-6 p-8">
      <header className="flex flex-col gap-1.5">
        <Link
          to=".."
          className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-marca-primario hover:underline"
        >
          <ChevronLeft aria-hidden="true" className="size-[18px]" />
          Usuarios
        </Link>
        <h1 className="text-2xl font-bold text-neutro-900">Nuevo usuario</h1>
        <p className="text-sm text-neutro-600">Define quién es y qué podrá hacer en el panel.</p>
      </header>

      {contexto.isError && (
        <p role="alert" className="rounded-card bg-estado-lleno-bg px-4 py-3 text-sm text-estado-lleno-texto">
          {mensajeDeError(contexto.error, 'No se pudo cargar tu parqueadero.')}
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <Tarjeta titulo="1 · Datos">
          <div className="grid gap-5 md:grid-cols-2">
            <Campo
              etiqueta="Nombre completo"
              icono={<User aria-hidden="true" className="size-5 text-neutro-600" />}
              error={errors.nombreCompleto?.message}
            >
              {(props) => (
                <input
                  {...props}
                  {...register('nombreCompleto')}
                  type="text"
                  autoComplete="off"
                  placeholder="Ej. Camilo Ospina"
                  className={CLASE_INPUT}
                />
              )}
            </Campo>
            <Campo
              etiqueta="Correo electrónico"
              icono={<Mail aria-hidden="true" className="size-5 text-neutro-600" />}
              error={errors.correo?.message}
            >
              {(props) => (
                <input
                  {...props}
                  {...register('correo')}
                  type="email"
                  autoComplete="off"
                  placeholder="camilo@correo.com"
                  className={CLASE_INPUT}
                />
              )}
            </Campo>
          </div>
        </Tarjeta>

        <Tarjeta titulo="2 · Rol" subtitulo="Elige uno y ya aplicamos los permisos habituales.">
          <RolSelector registro={register('rol')} error={errors.rol?.message} />
        </Tarjeta>

        {errorGeneral && (
          <p role="alert" className="rounded-card bg-estado-lleno-bg px-4 py-3 text-sm text-estado-lleno-texto">
            {errorGeneral}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <p className="flex flex-1 items-center gap-2 text-[13px] text-neutro-600">
            <Mail aria-hidden="true" className="size-4 shrink-0" />
            Le enviaremos una invitación al correo para que cree su contraseña.
          </p>
          <button
            type="button"
            onClick={() => navigate('..')}
            disabled={ocupado}
            className="rounded-[12px] border-[1.5px] border-neutro-300 bg-neutro-0 px-5 py-[13px] text-[15px] font-semibold text-neutro-900 transition-colors hover:bg-neutro-100 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={ocupado || !contexto.data}
            className="rounded-[12px] bg-marca-primario px-5 py-[13px] text-[15px] font-semibold text-neutro-0 shadow-[0_6px_16px_-4px_rgba(110,92,209,0.28)] transition-colors hover:bg-marca-oscuro disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ocupado ? 'Creando…' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </section>
  );
}

const CLASE_INPUT =
  'w-full min-w-0 bg-transparent text-[15px] text-neutro-900 outline-none placeholder:text-neutro-600/60';

function Tarjeta({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-neutro-300 bg-neutro-0 p-6">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold text-neutro-900">{titulo}</h2>
        {subtitulo && <p className="text-[13px] text-neutro-600">{subtitulo}</p>}
      </div>
      {children}
    </div>
  );
}

interface CampoProps {
  etiqueta: string;
  icono: ReactNode;
  error?: string;
  children: (props: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
  }) => ReactNode;
}

function Campo({ etiqueta, icono, error, children }: CampoProps) {
  const id = useId();
  const idError = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-neutro-900">
        {etiqueta}
      </label>
      <div
        className={cn(
          'flex items-center gap-3 rounded-[14px] border-[1.5px] bg-neutro-0 p-4 transition-colors focus-within:border-marca-primario',
          error ? 'border-estado-lleno' : 'border-neutro-300',
        )}
      >
        {icono}
        {children({
          id,
          'aria-invalid': Boolean(error),
          'aria-describedby': error ? idError : undefined,
        })}
      </div>
      {error && (
        <p id={idError} role="alert" className="text-sm text-estado-lleno-texto">
          {error}
        </p>
      )}
    </div>
  );
}