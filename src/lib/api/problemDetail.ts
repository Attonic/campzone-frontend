/** Erro de validação por campo devolvido pelo backend em `erros`. */
export interface ErroCampo {
  campo: string
  mensagem: string
}

/** ProblemDetail (RFC 9457) como o backend devolve em `application/problem+json`. */
export interface ProblemDetail {
  type: string
  title: string
  status: number
  detail?: string
  instance?: string
  /** Presente apenas em erros de validação. */
  erros?: ErroCampo[]
}

/** Erro lançado pelo cliente HTTP quando a API responde com falha. */
export class ApiError extends Error {
  readonly problem: ProblemDetail

  constructor(problem: ProblemDetail) {
    super(problem.detail ?? problem.title)
    this.name = 'ApiError'
    this.problem = problem
  }
}

/** Mensagem pronta para exibir ao usuário: `detail`, senão `title`. */
export function mensagemDoErro(error: unknown): string {
  if (error instanceof ApiError) {
    return error.problem.detail ?? error.problem.title
  }
  return 'Não foi possível concluir a operação. Tente novamente.'
}
