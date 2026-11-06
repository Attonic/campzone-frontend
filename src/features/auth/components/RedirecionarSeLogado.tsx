import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useSessao } from '../hooks/useSessao'
import { useUsuarioAtual } from '../hooks/useUsuarioAtual'
import { destinoPosLogin } from '../papel'
import { Carregando } from './Carregando'

/** Telas públicas de entrada: quem já está logado vai direto para a área do seu papel. */
export function RedirecionarSeLogado({ children }: { children: ReactNode }) {
  const sessao = useSessao()
  const usuario = useUsuarioAtual()
  const location = useLocation()

  if (!sessao) return children
  if (usuario.isPending) return <Carregando />
  if (usuario.data) {
    const origem = (location.state as { from?: unknown } | null)?.from
    return <Navigate to={destinoPosLogin(usuario.data.papel, origem)} replace />
  }
  return children
}
