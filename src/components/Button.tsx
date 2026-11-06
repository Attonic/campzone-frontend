import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
}

const base =
  'inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-not-allowed disabled:opacity-60'

const variantes: Record<Variante, string> = {
  primario: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300',
  secundario: 'border border-slate-600 text-slate-100 hover:bg-slate-800',
}

export function Button({ variante = 'primario', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${base} ${variantes[variante]} ${className}`} {...props} />
}
