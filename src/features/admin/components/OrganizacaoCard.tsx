import type { ReactNode } from 'react'
import { formatarData, formatarNumero } from '../../../lib/formatar'
import type { OrganizacaoAdminResponse } from '../types'

function rotuloCampeonatos(ativos: number, total: number): string {
  return `${formatarNumero(ativos)} ${ativos === 1 ? 'ativo' : 'ativos'} de ${formatarNumero(total)}`
}

/** Uma organização: cartão no celular; em telas largas, vira uma linha com colunas alinhadas. */
export function OrganizacaoCard({ organizacao }: { organizacao: OrganizacaoAdminResponse }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:flex-row md:items-center md:gap-6">
      <h3 className="min-w-0 break-words text-base font-semibold md:w-1/4 md:shrink-0">{organizacao.nome}</h3>
      <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 text-sm md:grid-cols-4">
        <Campo rotulo="Plano">{organizacao.planoNome}</Campo>
        <Campo rotulo="Usuários">{formatarNumero(organizacao.totalUsuarios)}</Campo>
        <Campo rotulo="Campeonatos">
          {rotuloCampeonatos(organizacao.campeonatosAtivos, organizacao.totalCampeonatos)}
        </Campo>
        <Campo rotulo="Criada em">
          <time dateTime={organizacao.criadoEm}>{formatarData(organizacao.criadoEm)}</time>
        </Campo>
      </dl>
    </li>
  )
}

function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-slate-400">{rotulo}</dt>
      <dd className="mt-0.5 text-slate-50">{children}</dd>
    </div>
  )
}
