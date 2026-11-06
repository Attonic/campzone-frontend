import { Outlet } from 'react-router'
import { BotaoSair } from '../../features/auth/components/BotaoSair'
import { useUsuarioAtual } from '../../features/auth/hooks/useUsuarioAtual'

/** Layout comum das áreas autenticadas: cabeçalho com título, nome do usuário e Sair. */
function AreaLayout({ titulo, subtitulo }: { titulo: string; subtitulo?: string | null }) {
  const { data: usuario } = useUsuarioAtual()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{titulo}</p>
            {subtitulo && <p className="truncate text-xs text-slate-400">{subtitulo}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className="max-w-40 truncate text-sm text-slate-300">{usuario?.nome}</span>
            <BotaoSair />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export function PainelLayout() {
  const { data: usuario } = useUsuarioAtual()
  return <AreaLayout titulo={usuario?.organizacaoNome ?? 'Meu painel'} subtitulo="CampZone" />
}

export function AdminLayout() {
  return <AreaLayout titulo="Admin da plataforma" subtitulo="CampZone" />
}
