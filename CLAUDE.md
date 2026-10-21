# CampZone: Frontend

Vale para tudo dentro de `frontend/` (repositório `campzone-frontend`). Regras comuns (contrato, DoD, git) estão no `CLAUDE.md` da raiz do workspace.

> Rascunho escrito pelo orquestrador a partir das regras dos agentes e do backlog. Revisar com o Antonio.

## Stack

React (estável mais recente), TypeScript `strict`, Vite, React Router, TanStack Query, Tailwind CSS (plugin oficial do Vite), Vitest + Testing Library + jsdom, ESLint. Versões nunca fixadas de memória: instale a estável mais recente e deixe o lockfile mandar.

Check obrigatório: `npm run lint && npm test && npm run build`.

## Estrutura

```
src/
  app/                    # bootstrap: providers (QueryClient, Router), layout, rotas
  lib/
    api/                  # cliente HTTP base (único lugar com fetch), ProblemDetail
  components/             # componentes visuais genéricos e reutilizáveis (Button, Input, Card...)
  features/
    campeonato/
      types.ts            # CriarCampeonatoRequest, CampeonatoResponse... (espelham o backend)
      api/campeonatoApi.ts  # funções que chamam o cliente base
      hooks/              # hooks TanStack Query (useCampeonatos, useCriarCampeonato)
      components/         # componentes da feature
      pages/              # telas ligadas a rotas
```

Features previstas: `auth`, `campeonato`, `participante`, `partida`, `classificacao`, `publico`.

## Padrão Request / Response

- Tipos em `features/<nome>/types.ts` com **os mesmos nomes e campos** do backend: `XxxRequest` (entrada) e `XxxResponse` (saída). Datas chegam como `string` ISO-8601.
- A spec da tarefa é a fonte do contrato. **Nunca invente campo nem endpoint.** Faltou algo, pare e reporte ao orquestrador.

## Camadas e acesso à API

- `fetch` só existe em `lib/api/`. Funções por feature em `features/<nome>/api/<nome>Api.ts` usam esse cliente.
- Componentes e páginas chamam **só hooks** (`features/<nome>/hooks/`). Nada de chamada à API dentro de componente.
- Erros da API chegam como `ProblemDetail` (RFC 9457) tipado. Mostre `detail` (ou `title`) ao usuário; erros de validação por campo quando vierem.
- Query keys centralizadas por feature (ex. `campeonatoKeys`). Mutations invalidam as queries afetadas.
- Token JWT: guardado em um único módulo de auth, enviado só no header `Authorization`. Nunca em URL, nunca em log.

## Regras gerais

- **Sem regra de negócio**: não calcule classificação, chaveamento, avanço de fase nem limites do plano. Exiba o que a API devolve. Limite do plano estourado é um erro 409 da API, mostrado ao usuário.
- Mobile first. A tela de lançar resultados precisa funcionar bem no celular.
- Acessibilidade: `label` em todo input, foco visível, navegação por teclado, contraste adequado, `aria-*` só quando o HTML semântico não basta.
- Toda tela que busca dados trata os estados de **loading, erro e vazio**.
- TypeScript `strict`. Sem `any` (se for inevitável, comentário justificando). Sem `@ts-ignore`.
- Formulários: validação de UX no front (campos obrigatórios), mas a validação que vale é a do backend.
- Textos da UI em português. Nomes de componentes em inglês ou português seguindo o domínio (`CampeonatoCard`, `ClassificacaoTable`).
- Sem `console.log` esquecido. Dependência nova só se for realmente necessária.

## Rotas

- Painel (autenticado): sob `/app/...`, protegido por guarda de rota.
- Página pública: `/c/:slug`, sem autenticação, consome só `/api/v1/public/**`.

## Testes

- Vitest + Testing Library: teste comportamento (o que o usuário vê e faz), não detalhes de implementação.
- Mock da API na camada `api/` (ou do `fetch` no cliente base), nunca chamando o backend real.
- Cada hook/tela nova cobre caminho feliz, erro (`ProblemDetail` exibido) e vazio.
