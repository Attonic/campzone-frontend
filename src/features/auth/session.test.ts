import { describe, expect, it, vi } from 'vitest'
import { getSessao, getToken, limparSessao, salvarSessao } from './session'

const futuro = () => new Date(Date.now() + 60_000).toISOString()

describe('session', () => {
  it('guarda e devolve o token; limpar remove', () => {
    salvarSessao({ token: 'abc', expiraEm: futuro() })
    expect(getToken()).toBe('abc')

    limparSessao()
    expect(getToken()).toBeNull()
    expect(localStorage.getItem('campzone.sessao')).toBeNull()
  })

  it('descarta token vencido do armazenamento', () => {
    salvarSessao({ token: 'abc', expiraEm: new Date(Date.now() - 1).toISOString() })

    expect(getToken()).toBeNull()
    expect(localStorage.getItem('campzone.sessao')).toBeNull()
  })

  it('descarta conteúdo corrompido', () => {
    localStorage.setItem('campzone.sessao', '{nao-json')

    expect(getToken()).toBeNull()
    expect(localStorage.getItem('campzone.sessao')).toBeNull()
  })

  it('notifica quem assina ao salvar e ao limpar', async () => {
    const { assinarSessao } = await import('./session')
    const ouvinte = vi.fn()
    const cancelar = assinarSessao(ouvinte)

    salvarSessao({ token: 'abc', expiraEm: futuro() })
    limparSessao()
    cancelar()
    salvarSessao({ token: 'x', expiraEm: futuro() })

    expect(ouvinte).toHaveBeenCalledTimes(2)
    expect(getSessao()?.token).toBe('x')
  })
})
