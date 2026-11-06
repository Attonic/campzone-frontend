/** Página de resultados como o backend devolve (`PaginaResponse<T>`). `pagina` começa em 0. */
export interface PaginaResponse<T> {
  itens: T[]
  pagina: number
  tamanho: number
  totalItens: number
  /** Vem 0 quando não há nenhum item (por exemplo, busca sem resultado). */
  totalPaginas: number
}
