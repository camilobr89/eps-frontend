import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from '../Pagination'

describe('Pagination', () => {
  it('renders the current range and triggers pagination changes', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    const onLimitChange = vi.fn()

    render(
      <Pagination
        page={2}
        limit={20}
        total={75}
        totalPages={4}
        hasNextPage
        hasPreviousPage
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />,
    )

    expect(screen.getByText('Mostrando 21-40 de 75 resultados')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
    expect(onPageChange).toHaveBeenCalledWith(3)

    await user.click(screen.getByRole('button', { name: 'Primera página' }))
    expect(onPageChange).toHaveBeenCalledWith(1)

    await user.selectOptions(screen.getByLabelText('Por página'), '50')
    expect(onLimitChange).toHaveBeenCalledWith(50)
  })
})
