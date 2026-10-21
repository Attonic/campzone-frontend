import { useState, type FormEvent } from 'react'
import { Alert, Button, Input } from '../../../components'
import { focarPrimeiroInvalido, interpretarErroApi } from '../erros'
import { useLogin } from '../hooks/useLogin'
import type { LoginRequest } from '../types'
import { validarLogin, type Erros } from '../validation'

const CAMPOS = ['email', 'senha'] as const

export function LoginForm() {
  const login = useLogin()
  const [valores, setValores] = useState<LoginRequest>({ email: '', senha: '' })
  const [errosUx, setErrosUx] = useState<Erros<LoginRequest>>({})
  const erroApi = interpretarErroApi(login.error, CAMPOS)

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const request = { ...valores, email: valores.email.trim() }
    const erros = validarLogin(request)
    setErrosUx(erros)
    if (Object.keys(erros).length > 0) {
      focarPrimeiroInvalido(evento.currentTarget, CAMPOS, erros)
      return
    }
    login.mutate(request)
  }

  return (
    <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-4">
      {erroApi.geral && <Alert>{erroApi.geral}</Alert>}
      <Input
        label="E-mail"
        name="email"
        required
        type="email"
        autoComplete="email"
        value={valores.email}
        onChange={(e) => setValores({ ...valores, email: e.target.value })}
        erro={errosUx.email ?? erroApi.campos.email}
      />
      <Input
        label="Senha"
        name="senha"
        required
        type="password"
        autoComplete="current-password"
        value={valores.senha}
        onChange={(e) => setValores({ ...valores, senha: e.target.value })}
        erro={errosUx.senha ?? erroApi.campos.senha}
      />
      <Button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}
