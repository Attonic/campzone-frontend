import { http } from '../../../lib/api'
import type {
  AutenticacaoResponse,
  CadastrarOrganizacaoRequest,
  LoginRequest,
  UsuarioResponse,
} from '../types'

export const authApi = {
  login: (request: LoginRequest) =>
    http.post<AutenticacaoResponse>('/public/auth/login', request),
  cadastrar: (request: CadastrarOrganizacaoRequest) =>
    http.post<AutenticacaoResponse>('/public/auth/cadastro', request),
  me: (signal?: AbortSignal) => http.get<UsuarioResponse>('/auth/me', { signal }),
}
