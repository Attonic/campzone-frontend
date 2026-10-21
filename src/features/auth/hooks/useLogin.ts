import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { salvarSessao } from '../session'
import type { AutenticacaoResponse, LoginRequest } from '../types'
import { authKeys } from './authKeys'

/** Guarda a sessão e já deixa o usuário no cache, sem precisar chamar `/auth/me`. */
export function useEntrarComResposta() {
  const queryClient = useQueryClient()
  return (resposta: AutenticacaoResponse) => {
    queryClient.setQueryData(authKeys.me, resposta.usuario)
    salvarSessao({ token: resposta.token, expiraEm: resposta.expiraEm })
  }
}

export function useLogin() {
  const entrar = useEntrarComResposta()
  return useMutation({
    mutationFn: (request: LoginRequest) => authApi.login(request),
    onSuccess: entrar,
  })
}
