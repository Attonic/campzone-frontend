import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { limparSessao } from '../../features/auth/session'
import { renderApp } from '../../test/renderApp'

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear()
    limparSessao()
  })

  it('exibe o título CampZone na rota /', () => {
    renderApp('/')

    expect(screen.getByRole('heading', { level: 1, name: 'CampZone' })).toBeInTheDocument()
  })

  it('sem sessão oferece Entrar e Criar conta', () => {
    renderApp('/')

    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute('href', '/cadastro')
  })
})
