import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { adminApi, type ListarOrganizacoesAdminParams } from '../api/adminApi'
import { adminKeys } from './adminKeys'

/**
 * Organizações da plataforma, paginadas (`GET /admin/organizacoes`).
 * Mantém a página anterior na tela enquanto a próxima carrega (`isPlaceholderData`).
 */
export function useOrganizacoesAdmin(params: ListarOrganizacoesAdminParams) {
  return useQuery({
    queryKey: adminKeys.organizacoes(params),
    queryFn: ({ signal }) => adminApi.listarOrganizacoes(params, signal),
    placeholderData: keepPreviousData,
  })
}
