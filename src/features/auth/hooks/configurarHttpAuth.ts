import type { QueryClient } from '@tanstack/react-query'
import { configurarAutenticacao } from '../../../lib/api'
import { assinarSessao, getSessao, getToken, limparSessao } from '../session'

let cancelarAssinatura: (() => void) | null = null

/**
 * Liga o cliente HTTP à sessão: envia o token e, num 401 de rota autenticada,
 * limpa a sessão. A guarda de rota então manda para `/login` guardando a origem.
 *
 * Sempre que o token da sessão muda (novo login, logout, token vencido descartado,
 * outra aba entrando com outro usuário), o cache do TanStack Query é limpo: dado
 * de um usuário nunca fica visível para o próximo.
 */
export function configurarHttpAuth(queryClient: QueryClient): void {
  cancelarAssinatura?.()

  let ultimoToken = getSessao()?.token ?? null
  cancelarAssinatura = assinarSessao(() => {
    const token = getSessao()?.token ?? null
    if (token === ultimoToken) return
    ultimoToken = token
    queryClient.clear()
  })

  configurarAutenticacao({
    obterToken: getToken,
    aoNaoAutorizado: limparSessao,
  })
}
