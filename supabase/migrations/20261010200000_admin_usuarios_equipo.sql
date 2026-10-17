-- F-7 (UNI-52): gestion de usuarios del administrador (lista y nuevo usuario).
-- Alcance acotado por D-ER3-12 (UNI-15), aun sin decidir: solo roles validos en el esquema
-- (propietario, operador, supervisor). No hay rol personalizado ni PERMISO_MODULO.

-- 1. Helper: el usuario actual es propietario activo del parqueadero.
CREATE OR REPLACE FUNCTION public.es_propietario_de(p_parqueadero_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select exists (
    select 1
    from public.asignacion_parqueadero a
    where a.parqueadero_id = p_parqueadero_id
      and a.usuario_id = (select public.usuario_actual_id())
      and a.rol = 'propietario'
      and a.estado = 'activo'
  )
$function$;

REVOKE ALL ON FUNCTION public.es_propietario_de(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.es_propietario_de(uuid) TO authenticated, service_role;

-- 2. Lectura: el propietario ve las asignaciones de su parqueadero y los datos de esas personas.
CREATE POLICY "asignacion_select_equipo" ON public.asignacion_parqueadero
  FOR SELECT
  TO authenticated
  USING ((SELECT public.es_propietario_de(parqueadero_id)));

CREATE POLICY "usuario_select_equipo" ON public.usuario
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.asignacion_parqueadero a
      WHERE a.usuario_id = usuario.id
        AND (SELECT public.es_propietario_de(a.parqueadero_id))
    )
  );

-- 3. Alta atomica: reutiliza el USUARIO si ya existe el correo, o crea uno sin firebase_uid
--    (se vincula cuando la persona acepte la invitacion), y registra la ASIGNACION_PARQUEADERO.
--    El propietario no se crea ni se edita desde aqui. Un duplicado falla con 23505 (asignacion_unica).
CREATE OR REPLACE FUNCTION public.crear_asignacion_personal(
  p_parqueadero_id uuid,
  p_nombre_completo text,
  p_correo text,
  p_rol text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_correo text := lower(btrim(p_correo));
  v_nombre text := btrim(p_nombre_completo);
  v_usuario_id uuid;
  v_asignacion_id uuid;
begin
  if not (select public.es_propietario_de(p_parqueadero_id)) then
    raise exception 'Solo el propietario puede gestionar el personal' using errcode = '42501';
  end if;

  if p_rol is null or p_rol not in ('operador', 'supervisor') then
    raise exception 'Rol no permitido' using errcode = '22023';
  end if;

  if v_nombre is null or length(v_nombre) < 3 then
    raise exception 'Nombre invalido' using errcode = '22023';
  end if;

  if v_correo is null or v_correo !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Correo invalido' using errcode = '22023';
  end if;

  select u.id into v_usuario_id
  from public.usuario u
  where u.correo = v_correo
  order by u.created_at
  limit 1;

  if v_usuario_id is null then
    insert into public.usuario (nombre_completo, correo)
    values (v_nombre, v_correo)
    returning id into v_usuario_id;
  end if;

  insert into public.asignacion_parqueadero (usuario_id, parqueadero_id, rol, estado)
  values (v_usuario_id, p_parqueadero_id, p_rol, 'activo')
  returning id into v_asignacion_id;

  return v_asignacion_id;
end;
$function$;

REVOKE ALL ON FUNCTION public.crear_asignacion_personal(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crear_asignacion_personal(uuid, text, text, text) TO authenticated, service_role;