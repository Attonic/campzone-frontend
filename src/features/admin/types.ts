/** `GET /admin/resumo`. */
export interface ResumoPlataformaResponse {
  totalOrganizacoes: number
  /** Organizadores + admins. */
  totalUsuarios: number
  totalCampeonatos: number
  campeonatosAtivos: number
}

/** Item de `GET /admin/organizacoes` (dentro de `PaginaResponse`). */
export interface OrganizacaoAdminResponse {
  id: number
  nome: string
  /** Ex.: `"GRATIS"`. */
  planoCodigo: string
  /** Ex.: `"Grátis"`. */
  planoNome: string
  totalUsuarios: number
  totalCampeonatos: number
  campeonatosAtivos: number
  /** ISO-8601 (o backend manda com microssegundos). */
  criadoEm: string
}
