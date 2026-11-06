import { mensagemDoErro } from '../lib/api'
import { Alert } from './Alert'
import { Button } from './Button'

/** Erro de uma busca de dados: mostra a mensagem da API (`ProblemDetail`) e oferece repetir. */
export function ErroAoCarregar({ erro, onTentarNovamente }: { erro: unknown; onTentarNovamente: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <Alert>{mensagemDoErro(erro)}</Alert>
      <Button variante="secundario" onClick={onTentarNovamente}>
        Tentar novamente
      </Button>
    </div>
  )
}
