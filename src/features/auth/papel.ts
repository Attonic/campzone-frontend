import type { Papel } from './types'

/** Área de cada papel (UX de navegação; a autorização real é do backend). */
export function areaDoPapel(papel: Papel): string {
  return papel === 'ADMIN_PLATAFORMA' ? '/admin' : '/app'
}

/**
 * Destino após entrar: volta para onde o usuário estava, se for uma página da
 * própria área do papel; senão, vai para a área do papel.
 */
export function destinoPosLogin(papel: Papel, origem?: unknown): string {
  const area = areaDoPapel(papel)
  // Aceita só caminho interno da área do papel (`/app`, `/app/x`, `/app?q=1`, `/app#y`).
  if (typeof origem === 'string' && new RegExp(`^${area}([/?#]|$)`).test(origem)) {
    return origem
  }
  return area
}
