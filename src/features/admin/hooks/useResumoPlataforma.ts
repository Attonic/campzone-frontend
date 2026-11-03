import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/adminApi'
import { adminKeys } from './adminKeys'

/** Números gerais da plataforma (`GET /admin/resumo`). */
export function useResumoPlataforma() {
  return useQuery({
    queryKey: adminKeys.resumo,
    queryFn: ({ signal }) => adminApi.resumo(signal),
  })
}
