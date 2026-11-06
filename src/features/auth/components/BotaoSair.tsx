import { Button } from '../../../components'
import { useLogout } from '../hooks/useLogout'

export function BotaoSair() {
  const sair = useLogout()
  return (
    <Button variante="secundario" onClick={sair}>
      Sair
    </Button>
  )
}
