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
