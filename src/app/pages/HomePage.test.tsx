import { render, screen } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { routes } from '../routes'

describe('HomePage', () => {
  it('exibe o título CampZone na rota /', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(<RouterProvider router={router} />)

    expect(screen.getByRole('heading', { level: 1, name: 'CampZone' })).toBeInTheDocument()
  })
})
