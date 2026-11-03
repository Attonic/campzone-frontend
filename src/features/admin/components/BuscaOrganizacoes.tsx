import { useState, type FormEvent } from 'react'
import { Button, Input } from '../../../components'

/** O backend aceita até 100 caracteres em `busca`. */
const MAX_BUSCA = 100

/** Busca por nome. Só consulta ao enviar (Enter ou "Buscar"); quem usa volta para a página 0. */
export function BuscaOrganizacoes({ onBuscar }: { onBuscar: (texto: string) => void }) {
  const [texto, setTexto] = useState('')

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    onBuscar(texto.trim())
  }

  return (
    <form role="search" onSubmit={enviar} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          label="Buscar organização por nome"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          maxLength={MAX_BUSCA}
          placeholder="Nome da organização"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
        />
      </div>
      <Button type="submit">Buscar</Button>
    </form>
  )
}
