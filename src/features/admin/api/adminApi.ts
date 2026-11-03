import { http, type PaginaResponse } from '../../../lib/api'
import type { OrganizacaoAdminResponse, ResumoPlataformaResponse } from '../types'

/** Query de `GET /admin/organizacoes`. `pagina` começa em 0; `tamanho` vai de 1 a 100. */
export interface ListarOrganizacoesAdminParams {
  pagina: number
  tamanho: number
  /** Texto do nome; vazio (ou só espaços) não é enviado. */
  busca: string
}

export const adminApi = {
  resumo: (signal?: AbortSignal) => http.get<ResumoPlataformaResponse>('/admin/resumo', { signal }),

  listarOrganizacoes: ({ pagina, tamanho, busca }: ListarOrganizacoesAdminParams, signal?: AbortSignal) => {
    const query = new URLSearchParams({ pagina: String(pagina), tamanho: String(tamanho) })
    const texto = busca.trim()
    if (texto) query.set('busca', texto)
    return http.get<PaginaResponse<OrganizacaoAdminResponse>>(`/admin/organizacoes?${query}`, { signal })
  },
}
