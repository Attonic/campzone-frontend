# CampZone: Frontend

Interface web do CampZone (React + TypeScript + Vite). O backend fica no repositório `campzone-backend`.

## Pré-requisitos (Fedora)

- Node.js 24 LTS ou superior e npm 11 (`sudo dnf install nodejs npm`, ou use `nvm`/`fnm`).
- Backend do `campzone-backend` rodando em `http://localhost:8080` para usar a API (veja o README dele).

## Rodando

```bash
npm install
cp .env.example .env   # opcional: o padrão já funciona em dev
npm run dev
```

A aplicação abre em `http://localhost:5173`. Em desenvolvimento, o Vite encaminha `/api` para `http://localhost:8080` (proxy), então a variável `VITE_API_URL` (padrão `/api/v1`) normalmente não precisa ser alterada.

## Checks

```bash
npm run lint
npm test
npm run build
```

O mesmo conjunto roda no GitHub Actions (`.github/workflows/ci.yml`) em todo push e pull request.

## Estrutura

```
src/
  app/        # providers (QueryClient, Router), rotas e páginas de bootstrap
  lib/api/    # cliente HTTP base e tipo ProblemDetail (RFC 9457)
  features/   # uma pasta por feature (nasce nas próximas tarefas)
```

Regras de desenvolvimento em `CLAUDE.md`.
