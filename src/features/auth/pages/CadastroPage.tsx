import { Link } from 'react-router'
import { AuthCard } from '../components/AuthCard'
import { CadastroForm } from '../components/CadastroForm'
import { RedirecionarSeLogado } from '../components/RedirecionarSeLogado'

export function CadastroPage() {
  return (
    <RedirecionarSeLogado>
      <AuthCard titulo="Criar conta">
        <CadastroForm />
        <p className="mt-5 text-center text-sm text-slate-300">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-emerald-300 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">
            Entrar
          </Link>
        </p>
      </AuthCard>
    </RedirecionarSeLogado>
  )
}
