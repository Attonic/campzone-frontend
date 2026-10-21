import { Link } from 'react-router'
import { AuthCard } from '../components/AuthCard'
import { LoginForm } from '../components/LoginForm'
import { RedirecionarSeLogado } from '../components/RedirecionarSeLogado'

export function LoginPage() {
  return (
    <RedirecionarSeLogado>
      <AuthCard titulo="Entrar">
        <LoginForm />
        <p className="mt-5 text-center text-sm text-slate-300">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-medium text-emerald-300 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">
            Criar conta
          </Link>
        </p>
      </AuthCard>
    </RedirecionarSeLogado>
  )
}
