import { useId, type InputHTMLAttributes } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  /** Mensagem de erro do campo (validação de UX ou da API). */
  erro?: string
}

export function Input({ label, erro, className = '', ...props }: InputProps) {
  const id = useId()
  const erroId = `${id}-erro`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? erroId : undefined}
        className={`min-h-11 rounded-lg border bg-slate-900 px-3 text-base text-slate-50 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${erro ? 'border-red-400' : 'border-slate-700'} ${className}`}
        {...props}
      />
      {erro && (
        <p id={erroId} className="text-sm text-red-300">
          {erro}
        </p>
      )}
    </div>
  )
}
