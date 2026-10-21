import { describe, expect, it } from 'vitest'
import { areaDoPapel, destinoPosLogin } from './papel'

describe('papel', () => {
  it('mapeia papel para área', () => {
    expect(areaDoPapel('ADMIN_PLATAFORMA')).toBe('/admin')
    expect(areaDoPapel('ORGANIZADOR')).toBe('/app')
  })

  it('volta à origem só se for da área do papel', () => {
    expect(destinoPosLogin('ORGANIZADOR', '/app/campeonatos/3?x=1')).toBe('/app/campeonatos/3?x=1')
    expect(destinoPosLogin('ORGANIZADOR', '/app?pagina=2')).toBe('/app?pagina=2')
    expect(destinoPosLogin('ORGANIZADOR', '/admin')).toBe('/app')
    expect(destinoPosLogin('ORGANIZADOR', '/application')).toBe('/app')
    expect(destinoPosLogin('ADMIN_PLATAFORMA', '/app')).toBe('/admin')
    expect(destinoPosLogin('ORGANIZADOR', undefined)).toBe('/app')
    expect(destinoPosLogin('ORGANIZADOR', 'https://evil.com/app')).toBe('/app')
  })
})
