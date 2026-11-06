import { ApiError, errosPorCampo, mensagemDoErro } from '../../lib/api'

/**
 * Separa o erro da API em mensagem do topo do formulário e erros por campo.
 * Erros de campos que o formulário não tem entram na mensagem do topo.
 */
export function interpretarErroApi(erro: unknown, camposDoFormulario: readonly string[]) {
  if (!erro) return { geral: undefined, campos: {} as Record<string, string> }

  const campos = errosPorCampo(erro)
  const orfaos =
    erro instanceof ApiError
      ? (erro.problem.erros ?? []).filter((e) => !camposDoFormulario.includes(e.campo))
      : []

  const geral = [mensagemDoErro(erro), ...orfaos.map((e) => e.mensagem)].join(' ')
  return { geral, campos }
}

/**
 * Leva o foco ao primeiro campo (na ordem do formulário) que tem erro, para quem
 * navega por teclado ou leitor de tela. Os inputs são achados pelo atributo `name`.
 */
export function focarPrimeiroInvalido(
  formulario: HTMLFormElement,
  ordem: readonly string[],
  erros: Record<string, string | undefined>,
): void {
  const primeiro = ordem.find((campo) => erros[campo])
  if (!primeiro) return
  const elemento = formulario.elements.namedItem(primeiro)
  if (elemento instanceof HTMLElement) elemento.focus()
}
