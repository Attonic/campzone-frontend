import { vi } from 'vitest'

type Corpo = unknown
export interface RespostaFake {
  status: number
  corpo?: Corpo
}

/** Respostas por "MÉTODO /caminho" (sem o prefixo /api/v1). */
export type RotasFake = Record<string, RespostaFake | (() => RespostaFake)>

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
    const caminho = url.replace(/^\/api\/v1/, '')
    const chave = `${init?.method ?? 'GET'} ${caminho}`
    const rota = rotas[chave]
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

export function chamadasA(fetchMock: ReturnType<typeof instalarApiFake>, chave: string) {
  return fetchMock.mock.calls.filter(
    ([url, init]) => `${init?.method ?? 'GET'} ${url.replace(/^\/api\/v1/, '')}` === chave,
  )
}
