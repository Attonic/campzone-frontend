import { describe, expect, it } from 'vitest'
import { formatarData, formatarNumero } from './formatar'

describe('formatarData', () => {
  it('formata ISO-8601 com microssegundos em pt-BR', () => {
    expect(formatarData('2026-11-03T12:30:05.193070Z')).toBe('03/11/2026')
  })

  it('aceita ISO sem fração', () => {
    expect(formatarData('2026-10-21T15:00:00Z')).toBe('21/10/2026')
  })

  it('devolve o texto original quando não é uma data', () => {
    expect(formatarData('não-é-data')).toBe('não-é-data')
  })
})

describe('formatarNumero', () => {
  it('usa ponto como separador de milhar', () => {
    expect(formatarNumero(1234567)).toBe('1.234.567')
    expect(formatarNumero(0)).toBe('0')
  })
})
