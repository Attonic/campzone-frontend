import { ApiError, type ProblemDetail } from './problemDetail'

const DEFAULT_BASE_URL = '/api/v1'

export function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL || DEFAULT_BASE_URL
  return url.replace(/\/+$/, '')
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Corpo serializado como JSON. */
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

function problemFallback(status: number, title: string): ProblemDetail {
  return { type: 'about:blank', title, status }
}

function isProblemDetail(value: unknown): value is ProblemDetail {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.title === 'string' && typeof candidate.status === 'number'
}

async function toApiError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('json')) {
    try {
      const body: unknown = await response.json()
      if (isProblemDetail(body)) {
        return new ApiError({ ...body, type: body.type ?? 'about:blank' })
      }
    } catch {
      // corpo inválido: cai no fallback abaixo
    }
  }
  return new ApiError(
    problemFallback(response.status, response.statusText || 'Erro inesperado'),
  )
}

/**
 * Cliente HTTP base. Único lugar do front que usa `fetch`.
 * Respostas de erro viram `ApiError` com um `ProblemDetail` tipado.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, signal } = options
  const hasBody = body !== undefined

  let response: Response
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers: {
        Accept: 'application/json, application/problem+json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: hasBody ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(
      problemFallback(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.'),
    )
  }

  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T

  return (await response.json()) as T
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
