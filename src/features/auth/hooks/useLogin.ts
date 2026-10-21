import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { salvarSessao } from '../session'
import type { AutenticacaoResponse, LoginRequest } from '../types'
import { authKeys } from './authKeys'

/**
 * Guarda a sessão e já deixa o usuário no cache, sem precisar chamar `/auth/me`.
 * O cache anterior é descartado antes: nada de outro usuário sobrevive ao novo login.
 */
export function useEntrarComResposta() {
  const queryClient = useQueryClient()
  return (resposta: AutenticacaoResponse) => {
    queryClient.clear()
    salvarSessao({ token: resposta.token, expiraEm: resposta.expiraEm })
    // Depois de salvar: a troca de token também limpa o cache (ver configurarHttpAuth).
    queryClient.setQueryData(authKeys.me, resposta.usuario)
  }
}

export function useLogin() {
  const entrar = useEntrarComResposta()
  return useMutation({
    mutationFn: (request: LoginRequest) => authApi.login(request),
    onSuccess: entrar,
  })
}
