/**
 * Único módulo que guarda o token JWT (localStorage, decisão do MVP).
 * O token nunca vai para URL nem para log. Guardamos só `token` e `expiraEm`;
 * o usuário vem de `GET /auth/me` (cache do TanStack Query).
 */

const CHAVE = 'campzone.sessao'

export interface Sessao {
  token: string
  /** ISO-8601, como veio em `AutenticacaoResponse.expiraEm`. */
  expiraEm: string
}

const ouvintes = new Set<() => void>()

// Fallback em memória quando o localStorage não está disponível (ex.: modo privado restrito).
let memoria: string | null = null

function lerBruto(): string | null {
  try {
    return localStorage.getItem(CHAVE)
  } catch {
    return memoria
  }
}

function gravarBruto(valor: string | null): void {
  try {
    if (valor === null) localStorage.removeItem(CHAVE)
    else localStorage.setItem(CHAVE, valor)
  } catch {
    memoria = valor
  }
}

function notificar(): void {
  ouvintes.forEach((ouvinte) => ouvinte())
}

function interpretar(bruto: string | null): Sessao | null {
  if (bruto === null) return null
  try {
    const valor: unknown = JSON.parse(bruto)
    if (typeof valor !== 'object' || valor === null) return null
    const { token, expiraEm } = valor as Record<string, unknown>
    if (typeof token !== 'string' || token === '') return null
    if (typeof expiraEm !== 'string' || Number.isNaN(Date.parse(expiraEm))) return null
    return { token, expiraEm }
  } catch {
    return null
  }
}

// Memoiza pelo texto bruto: o snapshot do useSyncExternalStore precisa ser estável.
let ultimoBruto: string | null | undefined
let ultimaSessao: Sessao | null = null

function sessaoArmazenada(): Sessao | null {
  const bruto = lerBruto()
  if (bruto !== ultimoBruto) {
    ultimoBruto = bruto
    ultimaSessao = interpretar(bruto)
  }
  return ultimaSessao
}

function vencida(sessao: Sessao): boolean {
  return Date.parse(sessao.expiraEm) <= Date.now()
}

/** Sessão válida (token não vencido), ou `null`. Sem efeitos colaterais. */
export function getSessao(): Sessao | null {
  const sessao = sessaoArmazenada()
  return sessao && !vencida(sessao) ? sessao : null
}

/** Token da sessão válida. Descarta do armazenamento um token vencido, sem chamar a API. */
export function getToken(): string | null {
  descartarSessaoExpirada()
  return getSessao()?.token ?? null
}

export function salvarSessao(sessao: Sessao): void {
  gravarBruto(JSON.stringify({ token: sessao.token, expiraEm: sessao.expiraEm }))
  notificar()
}

export function limparSessao(): void {
  if (lerBruto() === null) return
  gravarBruto(null)
  notificar()
}

/** Higiene de sessão: remove do armazenamento um token cujo `expiraEm` já passou. */
export function descartarSessaoExpirada(): void {
  const sessao = sessaoArmazenada()
  if (sessao && vencida(sessao)) limparSessao()
  else if (!sessao && lerBruto() !== null) limparSessao() // conteúdo corrompido
}

export function assinarSessao(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte)
  const aoMudarEmOutraAba = (evento: StorageEvent) => {
    if (evento.key === CHAVE || evento.key === null) ouvinte()
  }
  window.addEventListener('storage', aoMudarEmOutraAba)
  return () => {
    ouvintes.delete(ouvinte)
    window.removeEventListener('storage', aoMudarEmOutraAba)
  }
}
