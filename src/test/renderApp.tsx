import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { createQueryClient } from '../app/queryClient'
import { routes } from '../app/routes'
import { configurarHttpAuth } from '../features/auth/hooks/configurarHttpAuth'

interface OpcoesRenderApp {
  /** Desliga a repetição automática das queries: testes de erro não esperam o intervalo entre tentativas. */
  semRetry?: boolean
}

/** Renderiza o app completo (providers + rotas) numa rota inicial, com cliente HTTP ligado à sessão. */
export function renderApp(
  rotaInicial: string | { pathname: string; state?: unknown },
  { semRetry = false }: OpcoesRenderApp = {},
) {
  const queryClient = createQueryClient()
  if (semRetry) queryClient.setDefaultOptions({ queries: { retry: false, refetchOnWindowFocus: false } })
  configurarHttpAuth(queryClient)
  const router = createMemoryRouter(routes, { initialEntries: [rotaInicial] })

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router, queryClient }
}
