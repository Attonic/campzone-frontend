import { Link } from 'react-router'

const linkClasses =
  'inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300'

export function NaoEncontradaPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-slate-50">
      <h1 className="text-3xl font-bold tracking-tight">Página não encontrada</h1>
      <p className="max-w-md text-slate-300">O endereço que você acessou não existe.</p>
      <Link to="/" className={linkClasses}>
        Voltar para o início
      </Link>
    </main>
  )
}
