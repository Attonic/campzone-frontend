import { vi } from 'vitest'

type Corpo = unknown
export interface RespostaFake {
  status: number
  corpo?: Corpo
}

/**
 * Respostas por "MÉTODO /caminho" (sem o prefixo /api/v1). Rotas com query string podem
 * ser mockadas com a query completa ("GET /x?a=1") ou só pelo caminho ("GET /x").
 */
export type RotasFake = Record<string, RespostaFake | (() => RespostaFake)>

function chaveDe(url: string, init?: RequestInit): string {
  return `${init?.method ?? 'GET'} ${url.replace(/^\/api\/v1/, '')}`
}

function semQuery(chave: string): string {
  return chave.split('?')[0]
}

export const ok = (corpo: Corpo, status = 200): RespostaFake => ({ status, corpo })

export function problema(status: number, detail: string, extra: object = {}): RespostaFake {
  return {
    status,
    corpo: { type: 'about:blank', title: 'Erro', status, detail, ...extra },
  }
}

/** Troca o `fetch` por um fake que responde conforme `rotas`. Devolve o mock para inspeção. */
export function instalarApiFake(rotas: RotasFake) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const chave = chaveDe(url, init)
    const rota = rotas[chave] ?? rotas[semQuery(chave)]
    if (!rota) throw new Error(`Rota não mockada: ${chave}`)
    const { status, corpo } = typeof rota === 'function' ? rota() : rota
    return new Response(corpo === undefined ? null : JSON.stringify(corpo), {
      status,
      headers: { 'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Chamadas feitas a `chave`. Sem query na chave, casa com qualquer query daquele caminho. */
export function chamadasA(fetchMock: ReturnType<typeof instalarApiFake>, chave: string) {
  return fetchMock.mock.calls.filter(([url, init]) => {
    const feita = chaveDe(url, init)
    return feita === chave || semQuery(feita) === chave
  })
}

/** Query string de uma chamada registrada pelo mock. */
export function queryDe(chamada: readonly [string, RequestInit?]): URLSearchParams {
  const [url] = chamada
  return new URLSearchParams(url.split('?')[1] ?? '')
}
