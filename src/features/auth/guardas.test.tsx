import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { admin, autenticacao, organizador } from '../../test/fixtures'
import { chamadasA, instalarApiFake, ok, problema } from '../../test/fakeApi'
import { renderApp } from '../../test/renderApp'
import type { UsuarioResponse } from './types'

function semearSessao(usuario: UsuarioResponse, expiraEm = autenticacao(usuario).expiraEm) {
  localStorage.setItem('campzone.sessao', JSON.stringify({ token: 'jwt-salvo', expiraEm }))
}

describe('guardas de rota', () => {
  it('sem sessão em /app vai para /login, sem chamar a API', async () => {
    const fetchMock = instalarApiFake({})
    const { router } = renderApp('/app')

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sem sessão em /admin vai para /login', async () => {
    instalarApiFake({})
    const { router } = renderApp('/admin')

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('organizador em /admin vai para /app', async () => {
    instalarApiFake({ 'GET /auth/me': ok(organizador) })
    semearSessao(organizador)
    const { router } = renderApp('/admin')

    expect(await screen.findByText('Nenhum campeonato ainda')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/app')
  })

  it('admin em /app vai para /admin', async () => {
    instalarApiFake({ 'GET /auth/me': ok(admin) })
    semearSessao(admin)
    const { router } = renderApp('/app')

    expect(await screen.findByText('Painel da plataforma em construção.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/admin')
  })

  it('mostra erro com opção de tentar de novo quando /auth/me falha por outro motivo', async () => {
    instalarApiFake({ 'GET /auth/me': problema(500, 'Erro interno.') })
    semearSessao(organizador)
    renderApp('/app')

    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent('Erro interno.')
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })
})

describe('sessão', () => {
  it('ao abrir com token salvo valida com /auth/me enviando o Bearer', async () => {
    const fetchMock = instalarApiFake({ 'GET /auth/me': ok(organizador) })
    semearSessao(organizador)
    renderApp('/app')

    await screen.findByText('Nenhum campeonato ainda')
    const [, init] = chamadasA(fetchMock, 'GET /auth/me')[0]
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-salvo')
  })

  it('401 em /auth/me limpa a sessão e redireciona para /login', async () => {
    instalarApiFake({ 'GET /auth/me': problema(401, 'Token inválido ou expirado.') })
    semearSessao(organizador)
    const { router } = renderApp('/app')

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(localStorage.getItem('campzone.sessao')).toBeNull()
    expect(router.state.location.state).toEqual({ from: '/app' })
  })

  it('401 numa chamada autenticada depois de logado limpa a sessão e volta ao login', async () => {
    let resposta = ok(organizador)
    instalarApiFake({ 'GET /auth/me': () => resposta })
    semearSessao(organizador)
    const { router, queryClient } = renderApp('/app')
    await screen.findByText('Nenhum campeonato ainda')

    resposta = problema(401, 'Token inválido ou expirado.')
    await queryClient.refetchQueries({ queryKey: ['auth', 'me'] }).catch(() => {})

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(localStorage.getItem('campzone.sessao')).toBeNull()
    expect(queryClient.getQueryData(['auth', 'me'])).toBeUndefined()
  })

  it('token com expiraEm no passado é descartado sem chamar a API', async () => {
    const fetchMock = instalarApiFake({})
    semearSessao(organizador, new Date(Date.now() - 1000).toISOString())
    const { router } = renderApp('/app')

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(localStorage.getItem('campzone.sessao')).toBeNull()
  })

  it('logout limpa a sessão e o cache e vai para /login', async () => {
    instalarApiFake({ 'GET /auth/me': ok(organizador) })
    semearSessao(organizador)
    const { router, queryClient } = renderApp('/app')
    await screen.findByText('Nenhum campeonato ainda')

    await userEvent.setup().click(screen.getByRole('button', { name: 'Sair' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(localStorage.getItem('campzone.sessao')).toBeNull()
    expect(queryClient.getQueryData(['auth', 'me'])).toBeUndefined()
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('na home, logado, mostra "Ir para o painel"', async () => {
    instalarApiFake({ 'GET /auth/me': ok(admin) })
    semearSessao(admin)
    renderApp('/')

    const link = await screen.findByRole('link', { name: 'Ir para o painel' })
    await waitFor(() => expect(link).toHaveAttribute('href', '/admin'))
    expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument()
  })
})
