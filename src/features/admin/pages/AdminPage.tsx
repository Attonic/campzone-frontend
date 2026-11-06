import { OrganizacoesSecao } from '../components/OrganizacoesSecao'
import { ResumoCards } from '../components/ResumoCards'

/** `/admin`: visão geral da plataforma (só leitura, ADR 0002). */
export function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Visão geral da plataforma</h1>
      <ResumoCards />
      <OrganizacoesSecao />
    </div>
  )
}
