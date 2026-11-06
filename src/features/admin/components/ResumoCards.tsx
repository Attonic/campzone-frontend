import { useId } from 'react'
import { ErroAoCarregar } from '../../../components'
import { formatarNumero } from '../../../lib/formatar'
import { useResumoPlataforma } from '../hooks/useResumoPlataforma'
import type { ResumoPlataformaResponse } from '../types'

const ROTULOS: { campo: keyof ResumoPlataformaResponse; rotulo: string }[] = [
  { campo: 'totalOrganizacoes', rotulo: 'Organizações' },
  { campo: 'totalUsuarios', rotulo: 'Usuários' },
  { campo: 'totalCampeonatos', rotulo: 'Campeonatos' },
  { campo: 'campeonatosAtivos', rotulo: 'Campeonatos ativos' },
]

/** Os quatro números gerais da plataforma, exatamente como a API devolve. */
export function ResumoCards() {
  const tituloId = useId()
  const resumo = useResumoPlataforma()

  return (
    <section aria-labelledby={tituloId}>
      <h2 id={tituloId} className="sr-only">
        Resumo da plataforma
      </h2>

      {resumo.isPending && (
        <>
          <p role="status" className="sr-only">
            Carregando resumo…
          </p>
          <div aria-hidden className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {ROTULOS.map(({ campo }) => (
              <div key={campo} className="h-24 animate-pulse rounded-2xl bg-slate-900" />
            ))}
          </div>
        </>
      )}

      {resumo.isError && <ErroAoCarregar erro={resumo.error} onTentarNovamente={() => void resumo.refetch()} />}

      {resumo.isSuccess && (
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {ROTULOS.map(({ campo, rotulo }) => (
            <div key={campo} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <dt className="text-sm text-slate-300">{rotulo}</dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums">{formatarNumero(resumo.data[campo])}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
