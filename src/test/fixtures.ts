import type { AutenticacaoResponse, UsuarioResponse } from '../features/auth/types'

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
