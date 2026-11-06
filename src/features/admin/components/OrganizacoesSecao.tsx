import { useId, useState } from 'react'
import { ErroAoCarregar, Paginacao } from '../../../components'
import { formatarNumero } from '../../../lib/formatar'
import { useOrganizacoesAdmin } from '../hooks/useOrganizacoesAdmin'
import { BuscaOrganizacoes } from './BuscaOrganizacoes'
import { OrganizacaoCard } from './OrganizacaoCard'

const TAMANHO_PAGINA = 20

/** Busca por nome, lista paginada de organizações e seus estados (carregando, erro, vazio). */
export function OrganizacoesSecao() {
  const tituloId = useId()
  const [pagina, setPagina] = useState(0)
  const [busca, setBusca] = useState('')
  const consulta = useOrganizacoesAdmin({ pagina, tamanho: TAMANHO_PAGINA, busca })
  const dados = consulta.data

  function buscar(texto: string) {
    setBusca(texto)
    setPagina(0)
  }

  return (
    <section aria-labelledby={tituloId} className="flex flex-col gap-4">
      <h2 id={tituloId} className="text-lg font-semibold">
        Organizações
      </h2>

      <BuscaOrganizacoes onBuscar={buscar} />

      {consulta.isPending && (
        <p role="status" className="py-6 text-center text-slate-300">
          Carregando organizações…
        </p>
      )}

      {consulta.isError && (
        <ErroAoCarregar erro={consulta.error} onTentarNovamente={() => void consulta.refetch()} />
      )}

      {consulta.isSuccess && dados && (
        <>
          {dados.itens.length === 0 ? (
            <p
              role="status"
              className="rounded-2xl border border-dashed border-slate-700 px-6 py-10 text-center text-slate-300"
            >
              Nenhuma organização encontrada.
            </p>
          ) : (
            <>
              <p role="status" className="text-sm text-slate-300">
                {dados.totalItens === 1 ? '1 organização' : `${formatarNumero(dados.totalItens)} organizações`}
              </p>
              <ul
                aria-busy={consulta.isPlaceholderData}
                className={`flex flex-col gap-3 transition-opacity ${consulta.isPlaceholderData ? 'opacity-60' : ''}`}
              >
                {dados.itens.map((organizacao) => (
                  <OrganizacaoCard key={organizacao.id} organizacao={organizacao} />
                ))}
              </ul>
            </>
          )}

          {/* Sem itens a API manda totalPaginas 0: a Paginacao some em vez de mostrar "Página 1 de 0". */}
          <Paginacao
            pagina={dados.pagina}
            totalPaginas={dados.totalPaginas}
            onAnterior={() => setPagina(dados.pagina - 1)}
            onProxima={() => setPagina(dados.pagina + 1)}
          />
        </>
      )}
    </section>
  )
}
