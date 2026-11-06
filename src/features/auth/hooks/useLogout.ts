import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { limparSessao } from '../session'

/** Devolve a função `sair`: limpa a sessão e o cache do TanStack Query e vai para `/login`. */
export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return () => {
    limparSessao()
    queryClient.clear()
    void navigate('/login', { replace: true })
  }
}
