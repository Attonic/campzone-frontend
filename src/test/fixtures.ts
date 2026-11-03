import type { OrganizacaoAdminResponse, ResumoPlataformaResponse } from '../features/admin/types'
import type { AutenticacaoResponse, UsuarioResponse } from '../features/auth/types'
import type { PaginaResponse } from '../lib/api'

export const organizador: UsuarioResponse = {
  id: 2,
  nome: 'Maria Organizadora',
  email: 'organizador@campzone.dev',
  papel: 'ORGANIZADOR',
  organizacaoId: 10,
  organizacaoNome: 'Liga do Bairro',
}

export const admin: UsuarioResponse = {
  id: 1,
  nome: 'Admin CampZone',
  email: 'admin@campzone.dev',
  papel: 'ADMIN_PLATAFORMA',
  organizacaoId: null,
  organizacaoNome: null,
}

export function autenticacao(usuario: UsuarioResponse, token = 'jwt-teste'): AutenticacaoResponse {
  return {
    token,
    tipo: 'Bearer',
    expiraEm: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    usuario,
  }
}

/** Grava uma sessão válida no `localStorage`, como se o usuário já tivesse entrado. */
export function semearSessao(usuario: UsuarioResponse, token = 'jwt-salvo'): void {
  localStorage.setItem(
    'campzone.sessao',
    JSON.stringify({ token, expiraEm: autenticacao(usuario).expiraEm }),
  )
}

export const resumoPlataforma: ResumoPlataformaResponse = {
  totalOrganizacoes: 3,
  totalUsuarios: 4,
  totalCampeonatos: 4,
  campeonatosAtivos: 2,
}

export const copaSociety: OrganizacaoAdminResponse = {
  id: 3,
  nome: 'Copa Society',
  planoCodigo: 'GRATIS',
  planoNome: 'Grátis',
  totalUsuarios: 1,
  totalCampeonatos: 1,
  campeonatosAtivos: 0,
  // O backend manda microssegundos.
  criadoEm: '2026-11-03T12:30:05.193070Z',
}

export const ligaDoBairro: OrganizacaoAdminResponse = {
  id: 2,
  nome: 'Liga do Bairro',
  planoCodigo: 'GRATIS',
  planoNome: 'Grátis',
  totalUsuarios: 2,
  totalCampeonatos: 3,
  campeonatosAtivos: 2,
  criadoEm: '2026-10-21T15:00:00.000000Z',
}

export function paginaDe<T>(
  itens: T[],
  { pagina = 0, tamanho = 20, totalItens = itens.length, totalPaginas = Math.ceil(totalItens / tamanho) } = {},
): PaginaResponse<T> {
  return { itens, pagina, tamanho, totalItens, totalPaginas }
}
