import { act, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { describe, expect, it } from 'vitest'
import { autenticacao, organizador } from '../test/fixtures'
import { chamadasA, instalarApiFake, ok } from '../test/fakeApi'
import type { UsuarioResponse } from '../features/auth/types'

// O router do App é criado ao importar o módulo e lê a URL atual: posiciona antes.
window.history.pushState({}, '', '/app')
const CHAVE = 'campzone.sessao'
const expiraEm = autenticacao(organizador).expiraEm
localStorage.setItem(CHAVE, JSON.stringify({ token: 'jwt-A', expiraEm }))
const { App } = await import('./App')

describe('App sob StrictMode (como no npm run dev)', () => {
  it('troca de token por outra aba limpa o cache do app e rebusca /auth/me com o novo Bearer', async () => {
    const outra: UsuarioResponse = { ...organizador, id: 3, nome: 'Joana da Outra Liga', organizacaoNome: 'Outra Liga' }
    let resposta = ok(organizador)
    const fetchMock = instalarApiFake({ 'GET /auth/me': () => resposta })
    localStorage.setItem(CHAVE, JSON.stringify({ token: 'jwt-A', expiraEm }))

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    expect(await screen.findByText('Maria Organizadora')).toBeInTheDocument()

    resposta = ok(outra)
    act(() => {
      localStorage.setItem(CHAVE, JSON.stringify({ token: 'jwt-B', expiraEm }))
      window.dispatchEvent(new StorageEvent('storage', { key: CHAVE }))
    })

    expect(await screen.findByText('Joana da Outra Liga')).toBeInTheDocument()
    const chamadas = chamadasA(fetchMock, 'GET /auth/me')
    const [, init] = chamadas[chamadas.length - 1]
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-B')
  })
})
