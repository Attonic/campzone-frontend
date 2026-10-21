import { useEffect, useSyncExternalStore } from 'react'
import { assinarSessao, descartarSessaoExpirada, getSessao, type Sessao } from '../session'

/** Sessão atual (reativa). `null` quando não há login ou o token venceu. */
export function useSessao(): Sessao | null {
  const sessao = useSyncExternalStore(assinarSessao, getSessao, () => null)

  useEffect(() => {
    descartarSessaoExpirada()
  }, [])

  return sessao
}
