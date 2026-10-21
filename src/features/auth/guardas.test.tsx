import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { admin, autenticacao, organizador } from '../../test/fixtures'
import { chamadasA, instalarApiFake, ok, problema } from '../../test/fakeApi'
import { renderApp } from '../../test/renderApp'
import { salvarSessao } from './session'
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

  describe('cache ao trocar a sessão', () => {
    const outraOrganizadora: UsuarioResponse = {
      ...organizador,
      id: 3,
      nome: 'Joana da Outra Liga',
      organizacaoId: 11,
      organizacaoNome: 'Outra Liga',
    }
    const ME = ['auth', 'me']
    const novaSessao = (token: string) => ({ token, expiraEm: autenticacao(organizador).expiraEm })

    it('novo token via salvarSessao limpa o cache e busca /auth/me de novo', async () => {
      let resposta = ok(organizador)
      const fetchMock = instalarApiFake({ 'GET /auth/me': () => resposta })
      semearSessao(organizador)
      const { queryClient } = renderApp('/app')
      await screen.findByText('Maria Organizadora')
      queryClient.setQueryData(['campeonatos'], ['da-org-A'])

      resposta = ok(outraOrganizadora)
      act(() => {
        salvarSessao(novaSessao('jwt-B'))
        expect(queryClient.getQueryData(ME)).toBeUndefined()
        expect(queryClient.getQueryData(['campeonatos'])).toBeUndefined()
      })

      expect(await screen.findByText('Joana da Outra Liga')).toBeInTheDocument()
      expect(screen.getByText('Outra Liga')).toBeInTheDocument()
      expect(chamadasA(fetchMock, 'GET /auth/me')).toHaveLength(2)
      const [, init] = chamadasA(fetchMock, 'GET /auth/me')[1]
      expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-B')
    })

    it('outra aba entrando com outro usuário (StorageEvent) limpa o cache', async () => {
      let resposta = ok(organizador)
      const fetchMock = instalarApiFake({ 'GET /auth/me': () => resposta })
      semearSessao(organizador)
      const { queryClient } = renderApp('/app')
      await screen.findByText('Maria Organizadora')
      queryClient.setQueryData(['campeonatos'], ['da-org-A'])

      resposta = ok(outraOrganizadora)
      act(() => {
        localStorage.setItem('campzone.sessao', JSON.stringify(novaSessao('jwt-B')))
        window.dispatchEvent(new StorageEvent('storage', { key: 'campzone.sessao' }))
        expect(queryClient.getQueryData(['campeonatos'])).toBeUndefined()
      })

      expect(await screen.findByText('Joana da Outra Liga')).toBeInTheDocument()
      expect(chamadasA(fetchMock, 'GET /auth/me')).toHaveLength(2)
    })

    it('outra aba saindo (StorageEvent) limpa o cache e leva ao login', async () => {
      instalarApiFake({ 'GET /auth/me': ok(organizador) })
      semearSessao(organizador)
      const { router, queryClient } = renderApp('/app')
      await screen.findByText('Maria Organizadora')

      act(() => {
        localStorage.removeItem('campzone.sessao')
        window.dispatchEvent(new StorageEvent('storage', { key: 'campzone.sessao' }))
      })

      await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
      expect(queryClient.getQueryData(ME)).toBeUndefined()
    })

    it('token vencido descartado ao usar a API limpa o cache', async () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      let resposta = ok(organizador)
      instalarApiFake({ 'GET /auth/me': () => resposta })
      semearSessao(organizador)
      const { router, queryClient } = renderApp('/app')
      await screen.findByText('Maria Organizadora')
      queryClient.setQueryData(['campeonatos'], ['da-org-A'])

      vi.setSystemTime(Date.now() + 2 * 60 * 60 * 1000)
      resposta = problema(401, 'Token inválido ou expirado.')
      await act(() => queryClient.refetchQueries({ queryKey: ME }).catch(() => {}))

      await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
      expect(localStorage.getItem('campzone.sessao')).toBeNull()
      expect(queryClient.getQueryData(['campeonatos'])).toBeUndefined()
      expect(queryClient.getQueryData(ME)).toBeUndefined()
    })

    it('novo login no mesmo navegador não herda o cache anterior', async () => {
      instalarApiFake({
        'POST /public/auth/login': ok(autenticacao(outraOrganizadora, 'jwt-B')),
        'GET /auth/me': ok(outraOrganizadora),
      })
      const { queryClient } = renderApp('/login')
      queryClient.setQueryData(['campeonatos'], ['sobra-da-org-A'])

      const user = userEvent.setup()
      await user.type(screen.getByLabelText('E-mail'), 'joana@outra.com')
      await user.type(screen.getByLabelText('Senha'), 'senha12345')
      await user.click(screen.getByRole('button', { name: 'Entrar' }))

      expect(await screen.findByText('Joana da Outra Liga')).toBeInTheDocument()
      expect(queryClient.getQueryData(['campeonatos'])).toBeUndefined()
      expect(queryClient.getQueryData(ME)).toEqual(outraOrganizadora)
    })
  })
})
