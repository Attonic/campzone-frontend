import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, configurarAutenticacao, http } from '.'

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function problemResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/problem+json' },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  configurarAutenticacao(null)
})

function jsonOk() {
  return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
}

function headersEnviados(fetchMock: ReturnType<typeof mockFetch>, chamada = 0) {
  return (fetchMock.mock.calls[chamada][1] as RequestInit).headers as Record<string, string>
}

describe('httpClient', () => {
  it('devolve o JSON em respostas de sucesso, usando o baseURL padrão', async () => {
    const fetchMock = mockFetch(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(http.get<{ ok: boolean }>('/saude')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/saude', expect.objectContaining({ method: 'GET' }))
  })

  it('converte resposta de erro em ApiError com ProblemDetail tipado', async () => {
    mockFetch(
      problemResponse(
        {
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: 'Dados inválidos',
          instance: '/api/v1/campeonatos',
          erros: [{ campo: 'nome', mensagem: 'não deve estar em branco' }],
        },
        400,
      ),
    )

    const error = await http.post('/campeonatos', { nome: '' }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).problem).toEqual({
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: 'Dados inválidos',
      instance: '/api/v1/campeonatos',
      erros: [{ campo: 'nome', mensagem: 'não deve estar em branco' }],
    })
    expect((error as ApiError).message).toBe('Dados inválidos')
  })

  it('gera um ProblemDetail básico quando o erro não vem em JSON', async () => {
    mockFetch(new Response('boom', { status: 502, statusText: 'Bad Gateway' }))

    const error = await http.get('/x').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).problem).toMatchObject({ status: 502, title: 'Bad Gateway' })
  })

  it('converte falha de rede em ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const error = await http.get('/x').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).problem.status).toBe(0)
  })

  it('envia o corpo como JSON e trata 204 sem conteúdo', async () => {
    const fetchMock = mockFetch(new Response(null, { status: 204 }))

    await expect(http.post('/x', { a: 1 })).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/x',
      expect.objectContaining({ method: 'POST', body: '{"a":1}' }),
    )
  })

  it('trata 2xx sem corpo (201 vazio) como undefined', async () => {
    mockFetch(new Response('', { status: 201 }))

    await expect(http.post('/x', { a: 1 })).resolves.toBeUndefined()
  })

  it('converte 2xx com conteúdo não-JSON em ApiError claro', async () => {
    mockFetch(
      new Response('<html>ok</html>', { status: 200, headers: { 'Content-Type': 'text/html' } }),
    )

    const error = await http.get('/x').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).problem).toMatchObject({
      status: 200,
      title: 'Resposta inesperada do servidor.',
    })
  })

  it('converte 2xx com JSON malformado em ApiError', async () => {
    mockFetch(
      new Response('{quebrado', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )

    await expect(http.get('/x')).rejects.toBeInstanceOf(ApiError)
  })

  describe('autenticação', () => {
    it('envia Authorization: Bearer quando há token', async () => {
      const fetchMock = mockFetch(jsonOk())
      configurarAutenticacao({ obterToken: () => 'abc', aoNaoAutorizado: vi.fn() })

      await http.get('/auth/me')

      expect(headersEnviados(fetchMock).Authorization).toBe('Bearer abc')
    })

    it('não envia Authorization quando não há token', async () => {
      const fetchMock = mockFetch(jsonOk())
      configurarAutenticacao({ obterToken: () => null, aoNaoAutorizado: vi.fn() })

      await http.get('/auth/me')

      expect(headersEnviados(fetchMock)).not.toHaveProperty('Authorization')
    })

    it('não envia Authorization em rotas públicas', async () => {
      const fetchMock = mockFetch(jsonOk())
      configurarAutenticacao({ obterToken: () => 'abc', aoNaoAutorizado: vi.fn() })

      await http.post('/public/auth/login', {})

      expect(headersEnviados(fetchMock)).not.toHaveProperty('Authorization')
    })

    it('avisa a sessão quando rota autenticada responde 401, e ainda lança ApiError', async () => {
      mockFetch(problemResponse({ type: 'about:blank', title: 'Unauthorized', status: 401 }, 401))
      const aoNaoAutorizado = vi.fn()
      configurarAutenticacao({ obterToken: () => 'abc', aoNaoAutorizado })

      await expect(http.get('/auth/me')).rejects.toBeInstanceOf(ApiError)
      expect(aoNaoAutorizado).toHaveBeenCalledOnce()
    })

    it('não avisa a sessão no 401 de rota pública (login com senha errada)', async () => {
      mockFetch(problemResponse({ type: 'about:blank', title: 'Unauthorized', status: 401 }, 401))
      const aoNaoAutorizado = vi.fn()
      configurarAutenticacao({ obterToken: () => 'abc', aoNaoAutorizado })

      await expect(http.post('/public/auth/login', {})).rejects.toBeInstanceOf(ApiError)
      expect(aoNaoAutorizado).not.toHaveBeenCalled()
    })
  })
})
