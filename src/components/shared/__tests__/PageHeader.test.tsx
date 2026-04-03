import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from '../PageHeader'

describe('PageHeader', () => {
  it('should render title', () => {
    render(<PageHeader title="Autorizaciones" />)
    expect(screen.getByText('Autorizaciones')).toBeInTheDocument()
  })

  it('should render title and description', () => {
    render(
      <PageHeader
        title="Familia"
        description="Gestiona tus miembros de familia"
      />,
    )
    expect(screen.getByText('Familia')).toBeInTheDocument()
    expect(
      screen.getByText('Gestiona tus miembros de familia'),
    ).toBeInTheDocument()
  })

  it('should render action when provided', () => {
    render(
      <PageHeader
        title="Citas"
        action={<button>Nueva cita</button>}
      />,
    )
    expect(screen.getByText('Nueva cita')).toBeInTheDocument()
  })
})
