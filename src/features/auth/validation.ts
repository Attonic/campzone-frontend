import type { CadastrarOrganizacaoRequest, LoginRequest } from './types'

// Validação de UX apenas: a que vale é a do backend.

export type Erros<T> = Partial<Record<keyof T, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validarEmail(email: string): string | undefined {
  const valor = email.trim()
  if (valor === '') return 'O e-mail é obrigatório.'
  if (!EMAIL.test(valor)) return 'Informe um e-mail válido.'
  return undefined
}

function validarSenha(senha: string): string | undefined {
  if (senha === '') return 'A senha é obrigatória.'
  if (senha.length < 8) return 'A senha deve ter no mínimo 8 caracteres.'
  // O backend limita a 72 bytes (BCrypt): acentos contam 2.
  if (new TextEncoder().encode(senha).length > 72) {
    return 'A senha deve ter no máximo 72 bytes (caracteres acentuados contam 2).'
  }
  return undefined
}

function validarNome(valor: string, rotulo: string): string | undefined {
  const tamanho = valor.trim().length
  if (tamanho === 0) return `${rotulo} é obrigatório.`
  if (tamanho < 2 || tamanho > 100) return `${rotulo} deve ter entre 2 e 100 caracteres.`
  return undefined
}

function semVazios<T extends object>(erros: Erros<T>): Erros<T> {
  return Object.fromEntries(Object.entries(erros).filter(([, mensagem]) => mensagem)) as Erros<T>
}

export function validarLogin(valores: LoginRequest): Erros<LoginRequest> {
  return semVazios({ email: validarEmail(valores.email), senha: validarSenha(valores.senha) })
}

export function validarCadastro(
  valores: CadastrarOrganizacaoRequest,
): Erros<CadastrarOrganizacaoRequest> {
  return semVazios({
    nomeOrganizacao: validarNome(valores.nomeOrganizacao, 'O nome da organização'),
    nome: validarNome(valores.nome, 'O nome'),
    email: validarEmail(valores.email),
    senha: validarSenha(valores.senha),
  })
}
