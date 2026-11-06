import { Button } from './Button'

interface PaginacaoProps {
  /** Página atual, começando em 0 (como a API). */
  pagina: number
  totalPaginas: number
  onAnterior: () => void
  onProxima: () => void
}

/** "Anterior" / "Próxima" com "Página X de Y". Sem páginas (`totalPaginas` 0), não aparece. */
export function Paginacao({ pagina, totalPaginas, onAnterior, onProxima }: PaginacaoProps) {
  if (totalPaginas < 1) return null

  return (
    <nav aria-label="Paginação" className="flex items-center justify-between gap-3">
      <Button variante="secundario" onClick={onAnterior} disabled={pagina <= 0}>
        Anterior
      </Button>
      <p className="text-center text-sm text-slate-300">{`Página ${pagina + 1} de ${totalPaginas}`}</p>
      <Button variante="secundario" onClick={onProxima} disabled={pagina >= totalPaginas - 1}>
        Próxima
      </Button>
    </nav>
  )
}
