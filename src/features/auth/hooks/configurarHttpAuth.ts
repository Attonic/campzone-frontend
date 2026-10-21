import type { QueryClient } from '@tanstack/react-query'
import { configurarAutenticacao } from '../../../lib/api'
import { getToken, limparSessao } from '../session'

/**
 * Liga o cliente HTTP à sessão: envia o token e, num 401 de rota autenticada,
 * limpa a sessão e o cache. A guarda de rota então manda para `/login`
 * guardando a página de origem.
 */
export function configurarHttpAuth(queryClient: QueryClient): void {
  configurarAutenticacao({
    obterToken: getToken,
    aoNaoAutorizado: () => {
      limparSessao()
      queryClient.clear()
    },
  })
}
