// Espelham os payloads do backend (spec 02-auth). Nomes e campos idênticos.

export type Papel = 'ADMIN_PLATAFORMA' | 'ORGANIZADOR'

export interface CadastrarOrganizacaoRequest {
  nomeOrganizacao: string
  nome: string
  email: string
  senha: string
}

export interface LoginRequest {
  email: string
  senha: string
}

export interface UsuarioResponse {
  id: number
  nome: string
  email: string
  papel: Papel
  organizacaoId: number | null
  organizacaoNome: string | null
}

export interface AutenticacaoResponse {
  token: string
  tipo: 'Bearer'
  /** ISO-8601. */
  expiraEm: string
  usuario: UsuarioResponse
}
