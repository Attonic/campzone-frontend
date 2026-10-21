import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { Alert, Button } from '../../../components'
import { useLogout } from '../hooks/useLogout'
import { useSessao } from '../hooks/useSessao'
import { useUsuarioAtual } from '../hooks/useUsuarioAtual'
import { areaDoPapel } from '../papel'
import type { Papel } from '../types'
import { Carregando } from './Carregando'
import { mensagemDoErro } from '../../../lib/api'

/**
 * Guarda de rota (UX): exige sessão e o papel indicado. A autorização de
 * verdade é do backend. Sem sessão vai para `/login`, guardando a página de
 * origem; papel errado vai para a área do próprio papel.
 */
export function RotaProtegida({ papel, children }: { papel: Papel; children: ReactNode }) {
  const sessao = useSessao()
  const usuario = useUsuarioAtual()
  const location = useLocation()
  const sair = useLogout()

  if (!sessao) {
    const origem = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/login" replace state={{ from: origem }} />
  }

  if (usuario.isPending) return <Carregando />

  if (usuario.isError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-slate-50">
        <div className="w-full max-w-sm">
          <Alert>{mensagemDoErro(usuario.error)}</Alert>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => void usuario.refetch()}>Tentar novamente</Button>
          <Button variante="secundario" onClick={sair}>
            Sair
          </Button>
        </div>
      </main>
    )
  }

  if (usuario.data.papel !== papel) {
    return <Navigate to={areaDoPapel(usuario.data.papel)} replace />
  }

  return children
}
