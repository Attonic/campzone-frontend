import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import type { CadastrarOrganizacaoRequest } from '../types'
import { useEntrarComResposta } from './useLogin'

export function useCadastro() {
  const entrar = useEntrarComResposta()
  return useMutation({
    mutationFn: (request: CadastrarOrganizacaoRequest) => authApi.cadastrar(request),
    onSuccess: entrar,
  })
}
