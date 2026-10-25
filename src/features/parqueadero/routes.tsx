import type { RouteObject } from 'react-router';
import { PerfilParqueaderoPage } from './pages/PerfilParqueaderoPage';


export const parqueaderoRoutes: RouteObject = {
  path: 'parqueadero',
  children: [
    { path: 'perfil', element: <PerfilParqueaderoPage /> },
  ],
};