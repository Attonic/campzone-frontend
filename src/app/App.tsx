import { QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { configurarHttpAuth } from '../features/auth/hooks/configurarHttpAuth'
import { createQueryClient } from './queryClient'
import { routes } from './routes'

const router = createBrowserRouter(routes)

// Escopo do módulo (como o router): um único client por app. Criar dentro de um
// inicializador de useState faria o StrictMode rodar a configuração duas vezes e
// deixaria a assinatura da sessão ligada a um client descartado.
const queryClient = createQueryClient()
configurarHttpAuth(queryClient)

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
