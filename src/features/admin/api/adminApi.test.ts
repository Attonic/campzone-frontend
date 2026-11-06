import { describe, expect, it } from 'vitest'
import { chamadasA, instalarApiFake, ok, queryDe } from '../../../test/fakeApi'
import { paginaDe, resumoPlataforma } from '../../../test/fixtures'
import { adminApi } from './adminApi'

describe('adminApi', () => {
  it('resumo chama GET /admin/resumo', async () => {
    const fetchMock = instalarApiFake({ 'GET /admin/resumo': ok(resumoPlataforma) })

    await expect(adminApi.resumo()).resolves.toEqual(resumoPlataforma)
    expect(chamadasA(fetchMock, 'GET /admin/resumo')).toHaveLength(1)
  })

  it('listarOrganizacoes envia pagina e tamanho, sem busca quando vazia', async () => {
    const fetchMock = instalarApiFake({ 'GET /admin/organizacoes': ok(paginaDe([])) })

    await adminApi.listarOrganizacoes({ pagina: 2, tamanho: 20, busca: '   ' })

    const [chamada] = chamadasA(fetchMock, 'GET /admin/organizacoes')
    expect(Object.fromEntries(queryDe(chamada))).toEqual({ pagina: '2', tamanho: '20' })
  })

  it('listarOrganizacoes envia a busca sem espaços nas pontas e codificada', async () => {
    const fetchMock = instalarApiFake({ 'GET /admin/organizacoes': ok(paginaDe([])) })

    await adminApi.listarOrganizacoes({ pagina: 0, tamanho: 20, busca: '  Copa & Liga ' })

    const [chamada] = chamadasA(fetchMock, 'GET /admin/organizacoes')
    expect(queryDe(chamada).get('busca')).toBe('Copa & Liga')
    expect(chamada[0]).toContain('busca=Copa+%26+Liga')
  })
})
