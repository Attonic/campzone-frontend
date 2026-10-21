import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it, vi } from 'vitest'
import { autenticacao, organizador } from '../../test/fixtures'
import { instalarApiFake, ok } from '../../test/fakeApi'
import { renderApp } from '../../test/renderApp'
import { ErroPage } from './ErroPage'

describe('páginas de erro', () => {
  it('rota desconhecida mostra "Página não encontrada" com link para o início', async () => {
    const { router } = renderApp('/nao-existe')

    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('link', { name: 'Voltar para o início' }))
    expect(router.state.location.pathname).toBe('/')
  })

  it('subrota inexistente da área do painel também cai em "Página não encontrada"', () => {
    renderApp('/app/inexistente')

    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
  })

  it('login com origem inexistente da área do papel termina em "Página não encontrada", sem loop', async () => {
    instalarApiFake({
      'POST /public/auth/login': ok(autenticacao(organizador)),
      'GET /auth/me': ok(organizador),
    })
    const { router } = renderApp({ pathname: '/login', state: { from: '/app/inexistente' } })
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('E-mail'), 'organizador@campzone.dev')
    await user.type(screen.getByLabelText('Senha'), 'organizador123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
    await waitFor(() => expect(router.state.location.pathname).toBe('/app/inexistente'))
  })

  it('erro inesperado de renderização mostra a página de erro, não a tela padrão', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Quebrada(): never {
      throw new Error('boom')
    }
    const router = createMemoryRouter([{ path: '/', element: <Quebrada />, errorElement: <ErroPage /> }])
    render(<RouterProvider router={router} />)

    expect(screen.getByRole('heading', { name: 'Algo deu errado' })).toBeInTheDocument()
    expect(screen.queryByText(/Unexpected Application Error/)).not.toBeInTheDocument()
  })
})
