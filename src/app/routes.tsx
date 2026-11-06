import type { RouteObject } from 'react-router'
import { RotaProtegida } from '../features/auth/components/RotaProtegida'
import { CadastroPage } from '../features/auth/pages/CadastroPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { AdminLayout, PainelLayout } from './layouts/AreaLayout'
import { AdminPage } from './pages/AdminPage'
import { ErroPage } from './pages/ErroPage'
import { HomePage } from './pages/HomePage'
import { NaoEncontradaPage } from './pages/NaoEncontradaPage'
import { PainelPage } from './pages/PainelPage'

export const routes: RouteObject[] = [
  {
    errorElement: <ErroPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/cadastro', element: <CadastroPage /> },
      {
        path: '/app',
        element: (
          <RotaProtegida papel="ORGANIZADOR">
            <PainelLayout />
          </RotaProtegida>
        ),
        children: [{ index: true, element: <PainelPage /> }],
      },
      {
        path: '/admin',
        element: (
          <RotaProtegida papel="ADMIN_PLATAFORMA">
            <AdminLayout />
          </RotaProtegida>
        ),
        children: [{ index: true, element: <AdminPage /> }],
      },
      { path: '*', element: <NaoEncontradaPage /> },
    ],
  },
]
