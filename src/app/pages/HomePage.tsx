import { Link } from 'react-router'
import { areaDoPapel } from '../../features/auth/papel'
import { useSessao } from '../../features/auth/hooks/useSessao'
import { useUsuarioAtual } from '../../features/auth/hooks/useUsuarioAtual'

const linkBase =
  'inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300'

export function HomePage() {
  const sessao = useSessao()
  const { data: usuario } = useUsuarioAtual()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-950 px-6 text-center text-slate-50">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">CampZone</h1>
      <p className="max-w-md text-base text-slate-300 sm:text-lg">
        Organize campeonatos de qualquer modalidade e compartilhe a classificação e o
        chaveamento com todo mundo.
      </p>
      <nav aria-label="Acesso" className="mt-4 flex flex-wrap justify-center gap-3">
        {sessao ? (
          <Link
            to={usuario ? areaDoPapel(usuario.papel) : '/app'}
            className={`${linkBase} bg-emerald-400 text-slate-950 hover:bg-emerald-300`}
          >
            Ir para o painel
          </Link>
        ) : (
          <>
            <Link to="/login" className={`${linkBase} bg-emerald-400 text-slate-950 hover:bg-emerald-300`}>
              Entrar
            </Link>
            <Link to="/cadastro" className={`${linkBase} border border-slate-600 text-slate-100 hover:bg-slate-800`}>
              Criar conta
            </Link>
          </>
        )}
      </nav>
    </main>
  )
}
