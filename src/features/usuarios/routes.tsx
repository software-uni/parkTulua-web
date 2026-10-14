import type { RouteObject } from 'react-router';
import { NuevoUsuarioPage } from './pages/NuevoUsuarioPage';
import { UsuariosListaPage } from './pages/UsuariosListaPage';

/**
 * Rutas de Admin · Usuarios (F-7 / UNI-52). Se montan dentro del layout del administrador (F-2 / UNI-47),
 * por ejemplo como hijas de `/admin`: `/admin/usuarios` y `/admin/usuarios/nuevo`.
 */
export const usuariosRoutes: RouteObject = {
  path: 'usuarios',
  children: [
    { index: true, element: <UsuariosListaPage /> },
    { path: 'nuevo', element: <NuevoUsuarioPage /> },
  ],
};