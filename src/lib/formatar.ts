const formatadorData = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const formatadorNumero = new Intl.NumberFormat('pt-BR')

/**
 * Data ISO-8601 em pt-BR (`03/11/2026`), no fuso do navegador. O backend manda microssegundos
 * (`...05.193070Z`), que nem todo navegador aceita: só os 3 primeiros dígitos de fração são usados.
 * Valor que não seja data volta como veio, em vez de quebrar a tela.
 */
export function formatarData(iso: string): string {
  const data = new Date(iso.replace(/(\.\d{3})\d+/, '$1'))
  return Number.isNaN(data.getTime()) ? iso : formatadorData.format(data)
}

/** Número com separador de milhar pt-BR (`1.234`). */
export function formatarNumero(valor: number): string {
  return formatadorNumero.format(valor)
}
