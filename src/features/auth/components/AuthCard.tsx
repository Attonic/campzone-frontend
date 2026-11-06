import type { ReactNode } from 'react'

/** Moldura das telas de login e cadastro (visual escuro, mobile first). */
export function AuthCard({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-4 py-10 text-slate-50">
      <p className="text-2xl font-bold tracking-tight">CampZone</p>
      <section className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="mb-5 text-xl font-semibold">{titulo}</h1>
        {children}
      </section>
    </main>
  )
}
