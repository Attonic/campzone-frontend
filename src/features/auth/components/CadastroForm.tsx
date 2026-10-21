import { useState, type FormEvent } from 'react'
import { Alert, Button, Input } from '../../../components'
import { interpretarErroApi } from '../erros'
import { useCadastro } from '../hooks/useCadastro'
import type { CadastrarOrganizacaoRequest } from '../types'
import { validarCadastro, type Erros } from '../validation'

const CAMPOS = ['nomeOrganizacao', 'nome', 'email', 'senha'] as const

export function CadastroForm() {
  const cadastro = useCadastro()
  const [valores, setValores] = useState<CadastrarOrganizacaoRequest>({
    nomeOrganizacao: '',
    nome: '',
    email: '',
    senha: '',
  })
  const [errosUx, setErrosUx] = useState<Erros<CadastrarOrganizacaoRequest>>({})
  const erroApi = interpretarErroApi(cadastro.error, CAMPOS)

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const request: CadastrarOrganizacaoRequest = {
      nomeOrganizacao: valores.nomeOrganizacao.trim(),
      nome: valores.nome.trim(),
      email: valores.email.trim(),
      senha: valores.senha,
    }
    const erros = validarCadastro(request)
    setErrosUx(erros)
    if (Object.keys(erros).length > 0) return
    cadastro.mutate(request)
  }

  const erroDe = (campo: (typeof CAMPOS)[number]) => errosUx[campo] ?? erroApi.campos[campo]

  return (
    <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-4">
      {erroApi.geral && <Alert>{erroApi.geral}</Alert>}
      <Input
        label="Nome da organização"
        autoComplete="organization"
        value={valores.nomeOrganizacao}
        onChange={(e) => setValores({ ...valores, nomeOrganizacao: e.target.value })}
        erro={erroDe('nomeOrganizacao')}
      />
      <Input
        label="Seu nome"
        autoComplete="name"
        value={valores.nome}
        onChange={(e) => setValores({ ...valores, nome: e.target.value })}
        erro={erroDe('nome')}
      />
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        value={valores.email}
        onChange={(e) => setValores({ ...valores, email: e.target.value })}
        erro={erroDe('email')}
      />
      <Input
        label="Senha"
        type="password"
        autoComplete="new-password"
        value={valores.senha}
        onChange={(e) => setValores({ ...valores, senha: e.target.value })}
        erro={erroDe('senha')}
      />
      <Button type="submit" disabled={cadastro.isPending}>
        {cadastro.isPending ? 'Criando…' : 'Criar conta'}
      </Button>
    </form>
  )
}
