import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { autenticacao, organizador } from '../../../test/fixtures'
import { chamadasA, instalarApiFake, ok, problema } from '../../../test/fakeApi'
import { renderApp } from '../../../test/renderApp'

async function preencher(valores: Partial<Record<string, string>> = {}) {
  const user = userEvent.setup()
  const dados = {
    'Nome da organização': 'Liga do Bairro',
    'Seu nome': 'Maria Organizadora',
    'E-mail': 'maria@liga.com',
    Senha: 'senha-segura-1',
    ...valores,
  }
  for (const [rotulo, valor] of Object.entries(dados)) {
    await user.type(screen.getByLabelText(rotulo), valor as string)
  }
  await user.click(screen.getByRole('button', { name: 'Criar conta' }))
}

describe('CadastroPage', () => {
  it('cadastro ok entra logado e vai para /app', async () => {
    const fetchMock = instalarApiFake({
      'POST /public/auth/cadastro': ok(autenticacao(organizador), 201),
      'GET /auth/me': ok(organizador),
    })
    const { router } = renderApp('/cadastro')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('autocomplete', 'new-password')

    await preencher()

    expect(await screen.findByText('Nenhum campeonato ainda')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/app')
    const [, init] = chamadasA(fetchMock, 'POST /public/auth/cadastro')[0]
    expect(JSON.parse(init?.body as string)).toEqual({
      nomeOrganizacao: 'Liga do Bairro',
      nome: 'Maria Organizadora',
      email: 'maria@liga.com',
      senha: 'senha-segura-1',
    })
  })

  it('409 mostra o detail do backend', async () => {
    instalarApiFake({
      'POST /public/auth/cadastro': problema(409, 'Já existe um usuário cadastrado com este e-mail.'),
    })
    const { router } = renderApp('/cadastro')

    await preencher()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Já existe um usuário cadastrado com este e-mail.',
    )
    expect(router.state.location.pathname).toBe('/cadastro')
  })

  it('400 mostra os erros nos campos certos', async () => {
    instalarApiFake({
      'POST /public/auth/cadastro': problema(400, 'Dados inválidos.', {
        erros: [
          { campo: 'email', mensagem: 'O e-mail é inválido.' },
          { campo: 'nomeOrganizacao', mensagem: 'Nome da organização já usado.' },
        ],
      }),
    })
    renderApp('/cadastro')

    await preencher()

    const email = await screen.findByLabelText('E-mail')
    await screen.findByText('O e-mail é inválido.')
    expect(email).toHaveAccessibleDescription('O e-mail é inválido.')
    expect(screen.getByLabelText('Nome da organização')).toHaveAccessibleDescription(
      'Nome da organização já usado.',
    )
    expect(screen.getByLabelText('Seu nome')).not.toHaveAttribute('aria-invalid')
    expect(screen.getByRole('alert')).toHaveTextContent('Dados inválidos.')
  })

  it('validação de UX impede o envio', async () => {
    const fetchMock = instalarApiFake({})
    renderApp('/cadastro')

    await preencher({ 'Seu nome': 'M', 'E-mail': 'invalido', Senha: 'curta' })

    expect(await screen.findByText('O nome deve ter entre 2 e 100 caracteres.')).toBeInTheDocument()
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(screen.getByText('A senha deve ter no mínimo 8 caracteres.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
