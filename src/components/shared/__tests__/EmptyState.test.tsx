import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(
      <EmptyState
        title="No hay datos"
        description="Agrega un elemento para comenzar"
      />,
    )
    expect(screen.getByText('No hay datos')).toBeInTheDocument()
    expect(
      screen.getByText('Agrega un elemento para comenzar'),
    ).toBeInTheDocument()
  })

  it('should render without description', () => {
    render(<EmptyState title="Vacío" />)
    expect(screen.getByText('Vacío')).toBeInTheDocument()
  })

  it('should render action when provided', () => {
    render(
      <EmptyState
        title="Sin datos"
        action={<button>Crear nuevo</button>}
      />,
    )
    expect(screen.getByText('Crear nuevo')).toBeInTheDocument()
  })

  it('should render custom icon when provided', () => {
    render(
      <EmptyState
        title="Custom"
        icon={<span data-testid="custom-icon">icon</span>}
      />,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })
})
