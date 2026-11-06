import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../../../lib/api'
import { authApi } from '../api/authApi'
import { authKeys } from './authKeys'
import { useSessao } from './useSessao'

/** Usuário logado (`GET /auth/me`). Só consulta quando há sessão. */
export function useUsuarioAtual() {
  const sessao = useSessao()

  return useQuery({
    queryKey: authKeys.me,
    queryFn: ({ signal }) => authApi.me(signal),
    enabled: sessao !== null,
    staleTime: 60_000,
    // 401 já limpa a sessão no cliente HTTP; repetir a chamada não adianta.
    retry: (tentativas, erro) =>
      !(erro instanceof ApiError && erro.problem.status === 401) && tentativas < 1,
  })
}
