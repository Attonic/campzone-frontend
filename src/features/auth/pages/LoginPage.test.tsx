import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { admin, autenticacao, organizador, rotasAdmin } from '../../../test/fixtures'
import { chamadasA, instalarApiFake, ok, problema } from '../../../test/fakeApi'
import { renderApp } from '../../../test/renderApp'

async function preencherEEnviar(email: string, senha: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('E-mail'), email)
  await user.type(screen.getByLabelText('Senha'), senha)
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('LoginPage', () => {
  it('organizador entra e vai para /app, vendo organização, nome e Sair', async () => {
    instalarApiFake({
      'POST /public/auth/login': ok(autenticacao(organizador)),
      'GET /auth/me': ok(organizador),
    })
    const { router } = renderApp('/login')

    await preencherEEnviar('organizador@campzone.dev', 'organizador123')

    expect(await screen.findByText('Nenhum campeonato ainda')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/app')
    expect(screen.getByText('Liga do Bairro')).toBeInTheDocument()
    expect(screen.getByText('Maria Organizadora')).toBeInTheDocument()
    expect(screen.getByText('Em breve você poderá criar campeonatos aqui.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('admin entra e vai para /admin', async () => {
    instalarApiFake({
      'POST /public/auth/login': ok(autenticacao(admin)),
      'GET /auth/me': ok(admin),
      ...rotasAdmin(),
    })
    const { router } = renderApp('/login')

    await preencherEEnviar('admin@campzone.dev', 'admin12345')

    expect(await screen.findByRole('heading', { name: 'Visão geral da plataforma' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/admin')
    expect(screen.getByText('Admin da plataforma')).toBeInTheDocument()
  })

  it('envia email e senha no corpo, com campos de senha corretos', async () => {
    const fetchMock = instalarApiFake({
      'POST /public/auth/login': ok(autenticacao(organizador)),
      'GET /auth/me': ok(organizador),
    })
    renderApp('/login')

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('autocomplete', 'current-password')

    await preencherEEnviar('  organizador@campzone.dev ', 'organizador123')

    await screen.findByText('Nenhum campeonato ainda')
    const [, init] = chamadasA(fetchMock, 'POST /public/auth/login')[0]
    expect(JSON.parse(init?.body as string)).toEqual({
      email: 'organizador@campzone.dev',
      senha: 'organizador123',
    })
  })

  it('401 mostra a mensagem do backend e permanece no login', async () => {
    instalarApiFake({ 'POST /public/auth/login': problema(401, 'E-mail ou senha inválidos.') })
    const { router } = renderApp('/login')

    await preencherEEnviar('organizador@campzone.dev', 'senha-errada')

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
    expect(router.state.location.pathname).toBe('/login')
    expect(localStorage.length).toBe(0)
  })

  it('validação de UX impede o envio com e-mail inválido e senha curta', async () => {
    const fetchMock = instalarApiFake({})
    renderApp('/login')

    await preencherEEnviar('isso-nao-e-email', '1234')

    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(screen.getByText('A senha deve ter no mínimo 8 caracteres.')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInvalid()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('depois de um envio inválido, o foco vai para o primeiro campo inválido', async () => {
    instalarApiFake({})
    renderApp('/login')
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Senha'), '123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByLabelText('E-mail')).toHaveFocus()

    await user.type(screen.getByLabelText('E-mail'), 'a@b.com')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByLabelText('Senha')).toHaveFocus()
  })

  it('marca os campos como obrigatórios para leitores de tela', () => {
    instalarApiFake({})
    renderApp('/login')

    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-required', 'true')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('aria-required', 'true')
  })

  it('campos vazios mostram obrigatoriedade', async () => {
    const fetchMock = instalarApiFake({})
    renderApp('/login')

    await userEvent.setup().click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('O e-mail é obrigatório.')).toBeInTheDocument()
    expect(screen.getByText('A senha é obrigatória.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('desabilita o botão com "Entrando…" durante o envio', async () => {
    let liberar: () => void = () => {}
    const espera = new Promise<void>((resolve) => (liberar = resolve))
    const fetchMock = instalarApiFake({ 'GET /auth/me': ok(organizador) })
    const original = fetchMock.getMockImplementation()!
    fetchMock.mockImplementation(async (url, init) => {
      if (url.endsWith('/public/auth/login')) {
        await espera
        return new Response(JSON.stringify(autenticacao(organizador)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return original(url, init)
    })
    renderApp('/login')

    await preencherEEnviar('organizador@campzone.dev', 'organizador123')

    const botao = await screen.findByRole('button', { name: 'Entrando…' })
    expect(botao).toBeDisabled()
    liberar()
    await screen.findByText('Nenhum campeonato ainda')
  })

  it('já logado, /login redireciona pelo papel', async () => {
    instalarApiFake({ 'GET /auth/me': ok(admin), ...rotasAdmin() })
    localStorage.setItem(
      'campzone.sessao',
      JSON.stringify({ token: 'jwt', expiraEm: autenticacao(admin).expiraEm }),
    )
    const { router } = renderApp('/login')

    await waitFor(() => expect(router.state.location.pathname).toBe('/admin'))
  })

  it('volta para a página de origem após o login (volta do 401)', async () => {
    instalarApiFake({
      'POST /public/auth/login': ok(autenticacao(organizador)),
      'GET /auth/me': ok(organizador),
    })
    const { router } = renderApp('/app?pagina=2')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))

    await preencherEEnviar('organizador@campzone.dev', 'organizador123')

    await waitFor(() => expect(router.state.location.pathname).toBe('/app'))
    expect(router.state.location.search).toBe('?pagina=2')
  })
})
