import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('should render the correct label for known statuses', () => {
    const cases = [
      { status: 'pending', label: 'Pendiente' },
      { status: 'scheduled', label: 'Agendada' },
      { status: 'confirmed', label: 'Confirmada' },
      { status: 'completed', label: 'Completada' },
      { status: 'expired', label: 'Vencida' },
      { status: 'cancelled', label: 'Cancelada' },
      { status: 'no_show', label: 'No asistió' },
    ]

    for (const { status, label } of cases) {
      const { unmount } = render(<StatusBadge status={status} />)
      expect(screen.getByText(label)).toBeInTheDocument()
      unmount()
    }
  })

  it('should render raw status text for unknown statuses', () => {
    render(<StatusBadge status="custom_status" />)
    expect(screen.getByText('custom_status')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<StatusBadge status="pending" className="extra-class" />)
    const badge = screen.getByText('Pendiente')
    expect(badge.className).toContain('extra-class')
  })
})
