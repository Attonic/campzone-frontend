const linkClasses =
  'inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300'

/** `errorElement` da raiz: evita a tela padrão "Unexpected Application Error". */
export function ErroPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-slate-50">
      <h1 className="text-3xl font-bold tracking-tight">Algo deu errado</h1>
      <p className="max-w-md text-slate-300">
        Ocorreu um erro inesperado. Tente novamente em instantes.
      </p>
      {/* <a> comum (recarrega a página): o estado do router pode estar quebrado. */}
      <a href="/" className={linkClasses}>
        Voltar para o início
      </a>
    </main>
  )
}
