import type { ListarOrganizacoesAdminParams } from '../api/adminApi'

export const adminKeys = {
  all: ['admin'] as const,
  resumo: ['admin', 'resumo'] as const,
  organizacoes: (params: ListarOrganizacoesAdminParams) => ['admin', 'organizacoes', params] as const,
}
