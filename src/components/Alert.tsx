import type { ReactNode } from 'react'

/** Mensagem de erro de formulário/tela, anunciada por leitores de tela. */
export function Alert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-400/60 bg-red-950/60 px-3 py-2 text-sm text-red-100"
    >
      {children}
    </div>
  )
}
