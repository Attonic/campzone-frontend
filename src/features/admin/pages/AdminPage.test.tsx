import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { chamadasA, instalarApiFake, ok, problema, queryDe } from '../../../test/fakeApi'
import {
  admin,
  copaSociety,
  ligaDoBairro,
  paginaDe,
  resumoPlataforma,
  semearSessao,
  xadrezClube,
} from '../../../test/fixtures'
import { renderApp } from '../../../test/renderApp'

const LISTA = 'GET /admin/organizacoes'
const PAGINA_0 = `${LISTA}?pagina=0&tamanho=20`
const PAGINA_1 = `${LISTA}?pagina=1&tamanho=20`

/** Duas páginas: a 0 com 2 organizações e a 1 com 1 (3 no total). */
const duasPaginas = {
  [PAGINA_0]: ok(paginaDe([copaSociety, ligaDoBairro], { pagina: 0, totalItens: 3, totalPaginas: 2 })),
  [PAGINA_1]: ok(paginaDe([xadrezClube], { pagina: 1, totalItens: 3, totalPaginas: 2 })),
}

function abrirAdmin(rotas: Parameters<typeof instalarApiFake>[0], opcoes = { semRetry: true }) {
  const fetchMock = instalarApiFake({
    'GET /auth/me': ok(admin),
    'GET /admin/resumo': ok(resumoPlataforma),
    ...rotas,
  })
  semearSessao(admin)
  renderApp('/admin', opcoes)
  return fetchMock
}

// As regiões só existem depois que /auth/me confirma o admin e a página monta.
const regiaoResumo = async () => within(await screen.findByRole('region', { name: 'Resumo da plataforma' }))
const regiaoOrganizacoes = async () => within(await screen.findByRole('region', { name: 'Organizações' }))
const botao = (nome: string) => screen.getByRole('button', { name: nome })

function cartao(nome: string) {
  const item = screen.getByRole('heading', { level: 3, name: nome }).closest('li')
  if (!item) throw new Error(`Cartão de "${nome}" não encontrado`)
  return within(item)
}

describe('AdminPage: resumo', () => {
  it('mostra os quatro números do resumo, cada um sob o seu rótulo', async () => {
    abrirAdmin({
      'GET /admin/resumo': ok({
        totalOrganizacoes: 12,
        totalUsuarios: 34,
        totalCampeonatos: 1560,
        campeonatosAtivos: 7,
      }),
      [LISTA]: ok(paginaDe([copaSociety])),
    })

    await screen.findByText('1.560')
    const resumo = await regiaoResumo()
    const valorDe = (rotulo: string) => resumo.getByText(rotulo, { selector: 'dt' }).nextElementSibling
    expect(valorDe('Organizações')).toHaveTextContent('12')
    expect(valorDe('Usuários')).toHaveTextContent('34')
    expect(valorDe('Campeonatos')).toHaveTextContent('1.560')
    expect(valorDe('Campeonatos ativos')).toHaveTextContent('7')
  })

  it('enquanto carrega mostra o estado de carregamento', async () => {
    let liberar: () => void = () => {}
    const espera = new Promise<void>((resolve) => (liberar = resolve))
    const fetchMock = abrirAdmin({ [LISTA]: ok(paginaDe([copaSociety])) })
    const original = fetchMock.getMockImplementation()!
    fetchMock.mockImplementation(async (url, init) => {
      if (url.includes('/admin/')) await espera
      return original(url, init)
    })

    expect(await screen.findByText('Carregando resumo…')).toBeInTheDocument()
    expect(screen.getByText('Carregando organizações…')).toBeInTheDocument()

    liberar()
    expect(await screen.findByText('Copa Society')).toBeInTheDocument()
    expect(screen.queryByText('Carregando organizações…')).not.toBeInTheDocument()
    expect(screen.queryByText('Carregando resumo…')).not.toBeInTheDocument()
  })

  it('erro no resumo mostra a mensagem da API e "Tentar novamente" busca de novo', async () => {
    let resposta = problema(500, 'Não foi possível calcular o resumo.')
    abrirAdmin({ 'GET /admin/resumo': () => resposta, [LISTA]: ok(paginaDe([copaSociety])) })

    const resumo = await regiaoResumo()
    expect(await resumo.findByRole('alert')).toHaveTextContent('Não foi possível calcular o resumo.')
    // A lista é independente: segue disponível.
    expect(await screen.findByText('Copa Society')).toBeInTheDocument()

    resposta = ok(resumoPlataforma)
    await userEvent.setup().click(resumo.getByRole('button', { name: 'Tentar novamente' }))

    expect(await resumo.findByText('Campeonatos ativos')).toBeInTheDocument()
    expect(resumo.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('AdminPage: lista de organizações', () => {
  it('mostra nome, plano, usuários, campeonatos (ativos de total) e a data em pt-BR', async () => {
    const fetchMock = abrirAdmin({ [LISTA]: ok(paginaDe([copaSociety, ligaDoBairro], { totalItens: 2 })) })

    expect(await screen.findByRole('heading', { level: 1, name: 'Visão geral da plataforma' })).toBeInTheDocument()
    await screen.findByText('Copa Society')

    const copa = cartao('Copa Society')
    expect(copa.getByText('Plano').nextElementSibling).toHaveTextContent('Grátis')
    expect(copa.getByText('Usuários').nextElementSibling).toHaveTextContent('1')
    expect(copa.getByText('Campeonatos').nextElementSibling).toHaveTextContent('0 ativos de 1')
    expect(copa.getByText('03/11/2026')).toHaveAttribute('datetime', copaSociety.criadoEm)

    const liga = cartao('Liga do Bairro')
    expect(liga.getByText('Usuários').nextElementSibling).toHaveTextContent('2')
    expect(liga.getByText('Campeonatos').nextElementSibling).toHaveTextContent('2 ativos de 3')
    expect(liga.getByText('21/10/2026')).toBeInTheDocument()

    expect((await regiaoOrganizacoes()).getByText('2 organizações')).toBeInTheDocument()

    // Primeira carga: página 0, tamanho 20, sem busca; o token vai no Authorization.
    const [chamada] = chamadasA(fetchMock, LISTA)
    expect(Object.fromEntries(queryDe(chamada))).toEqual({ pagina: '0', tamanho: '20' })
    expect((chamada[1]?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-salvo')
  })

  it('sem organizações mostra "Nenhuma organização encontrada." e esconde a paginação', async () => {
    abrirAdmin({ [LISTA]: ok(paginaDe([], { totalPaginas: 0 })) })

    expect(await screen.findByText('Nenhuma organização encontrada.')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Página/)).not.toBeInTheDocument()
  })

  it('erro na lista mostra a mensagem da API e "Tentar novamente" busca de novo', async () => {
    let resposta = problema(500, 'Falha ao listar as organizações.')
    abrirAdmin({ [LISTA]: () => resposta })

    const organizacoes = await regiaoOrganizacoes()
    expect(await organizacoes.findByRole('alert')).toHaveTextContent('Falha ao listar as organizações.')
    expect(screen.queryByText('Nenhuma organização encontrada.')).not.toBeInTheDocument()

    resposta = ok(paginaDe([copaSociety]))
    await userEvent.setup().click(organizacoes.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText('Copa Society')).toBeInTheDocument()
    expect(organizacoes.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('AdminPage: paginação', () => {
  it('nas pontas o botão fica desabilitado e "Próxima" pede pagina=1', async () => {
    const fetchMock = abrirAdmin(duasPaginas)
    const user = userEvent.setup()

    expect(await screen.findByText('Página 1 de 2')).toBeInTheDocument()
    expect(botao('Anterior')).toBeDisabled()
    expect(botao('Próxima')).toBeEnabled()

    await user.click(botao('Próxima'))

    expect(await screen.findByText('Xadrez Clube')).toBeInTheDocument()
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument()
    expect(chamadasA(fetchMock, PAGINA_1)).toHaveLength(1)
    expect(screen.queryByText('Copa Society')).not.toBeInTheDocument()
    expect(botao('Próxima')).toBeDisabled()
    expect(botao('Anterior')).toBeEnabled()

    await user.click(botao('Anterior'))

    expect(await screen.findByText('Copa Society')).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()
  })

  it('mantém a página anterior na tela enquanto a próxima carrega e não pula páginas', async () => {
    let liberar: () => void = () => {}
    const espera = new Promise<void>((resolve) => (liberar = resolve))
    const fetchMock = abrirAdmin(duasPaginas)
    const original = fetchMock.getMockImplementation()!
    fetchMock.mockImplementation(async (url, init) => {
      if (url.includes('pagina=1')) await espera
      return original(url, init)
    })
    const user = userEvent.setup()
    await screen.findByText('Copa Society')

    await user.click(botao('Próxima'))
    await user.click(botao('Próxima'))

    await waitFor(() => expect(chamadasA(fetchMock, PAGINA_1)).toHaveLength(1))
    expect(screen.getByText('Copa Society')).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()
    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true')

    liberar()
    expect(await screen.findByText('Xadrez Clube')).toBeInTheDocument()
    expect(screen.queryByText('Copa Society')).not.toBeInTheDocument()
    expect(chamadasA(fetchMock, `${LISTA}?pagina=2&tamanho=20`)).toHaveLength(0)
  })

  it('com uma página só mostra "Página 1 de 1" com os dois botões desabilitados', async () => {
    abrirAdmin({ [LISTA]: ok(paginaDe([copaSociety], { totalPaginas: 1 })) })

    expect(await screen.findByText('Página 1 de 1')).toBeInTheDocument()
    expect(botao('Anterior')).toBeDisabled()
    expect(botao('Próxima')).toBeDisabled()
  })
})

describe('AdminPage: busca', () => {
  const rotasDeBusca = {
    ...duasPaginas,
    [`${PAGINA_0}&busca=copa`]: ok(paginaDe([copaSociety], { pagina: 0, totalPaginas: 1 })),
    [`${PAGINA_0}&busca=zzz`]: ok(paginaDe([], { totalPaginas: 0 })),
  }
  const campoBusca = () => screen.getByRole('searchbox', { name: 'Buscar organização por nome' })

  it('envia a busca (sem espaços nas pontas) e volta para a página 0', async () => {
    const fetchMock = abrirAdmin(rotasDeBusca)
    const user = userEvent.setup()
    await screen.findByText('Copa Society')
    await user.click(botao('Próxima'))
    await screen.findByText('Xadrez Clube')

    await user.type(campoBusca(), '  copa ')
    await user.click(botao('Buscar'))

    await waitFor(() => expect(screen.queryByText('Xadrez Clube')).not.toBeInTheDocument())
    expect(await screen.findByText('Copa Society')).toBeInTheDocument()
    expect(screen.queryByText('Liga do Bairro')).not.toBeInTheDocument()
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument()

    const ultima = chamadasA(fetchMock, LISTA).at(-1)!
    expect(Object.fromEntries(queryDe(ultima))).toEqual({ pagina: '0', tamanho: '20', busca: 'copa' })
  })

  it('Enter no campo também busca', async () => {
    const fetchMock = abrirAdmin(rotasDeBusca)
    await screen.findByText('Copa Society')

    await userEvent.setup().type(campoBusca(), 'copa{Enter}')

    await waitFor(() => expect(chamadasA(fetchMock, `${PAGINA_0}&busca=copa`)).toHaveLength(1))
    await waitFor(() => expect(screen.queryByText('Liga do Bairro')).not.toBeInTheDocument())
  })

  it('só consulta ao enviar: digitar não dispara chamadas', async () => {
    const fetchMock = abrirAdmin(rotasDeBusca)
    await screen.findByText('Copa Society')

    await userEvent.setup().type(campoBusca(), 'cop')

    expect(chamadasA(fetchMock, LISTA)).toHaveLength(1)
  })

  it('busca sem resultado mostra o estado vazio, sem "Página 1 de 0"', async () => {
    abrirAdmin(rotasDeBusca)
    const user = userEvent.setup()
    await screen.findByText('Copa Society')

    await user.type(campoBusca(), 'zzz')
    await user.click(botao('Buscar'))

    expect(await screen.findByText('Nenhuma organização encontrada.')).toBeInTheDocument()
    expect(screen.queryByText(/Página/)).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument()
  })

  it('limpar o campo e buscar de novo volta à lista completa (sem o parâmetro busca)', async () => {
    const fetchMock = abrirAdmin(rotasDeBusca)
    const user = userEvent.setup()
    await screen.findByText('Liga do Bairro')
    await user.type(campoBusca(), 'copa')
    await user.click(botao('Buscar'))
    await waitFor(() => expect(screen.queryByText('Liga do Bairro')).not.toBeInTheDocument())

    await user.clear(campoBusca())
    await user.click(botao('Buscar'))

    expect(await screen.findByText('Liga do Bairro')).toBeInTheDocument()
    const ultima = chamadasA(fetchMock, LISTA).at(-1)!
    expect(queryDe(ultima).has('busca')).toBe(false)
  })

  it('limita o campo a 100 caracteres, como a API', async () => {
    abrirAdmin(rotasDeBusca)
    await screen.findByText('Copa Society')

    expect(campoBusca()).toHaveAttribute('maxlength', '100')
  })
})
