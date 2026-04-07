import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QueryWrapper } from '../QueryWrapper'

describe('QueryWrapper', () => {
  it('renders loading state', () => {
    render(
      <QueryWrapper
        query={{
          data: undefined,
          error: null,
          isError: false,
          isLoading: true,
          refetch: vi.fn(),
        }}
      >
        {() => <div>ready</div>}
      </QueryWrapper>,
    )

    expect(document.querySelector('.animate-spin')).not.toBeNull()
  })

  it('renders error state and retries', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()

    render(
      <QueryWrapper
        query={{
          data: undefined,
          error: new Error('Network'),
          isError: true,
          isLoading: false,
          refetch,
        }}
      >
        {() => <div>ready</div>}
      </QueryWrapper>,
    )

    expect(screen.getByText('No fue posible cargar esta información')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('renders empty state and data state', () => {
    const { rerender } = render(
      <QueryWrapper
        query={{
          data: { items: [] },
          error: null,
          isError: false,
          isLoading: false,
          refetch: vi.fn(),
        }}
        isEmpty={(data) => data.items.length === 0}
        emptyState={<div>vacío</div>}
      >
        {(data) => <div>{data.items.length}</div>}
      </QueryWrapper>,
    )

    expect(screen.getByText('vacío')).toBeInTheDocument()

    rerender(
      <QueryWrapper
        query={{
          data: { items: ['a', 'b'] },
          error: null,
          isError: false,
          isLoading: false,
          refetch: vi.fn(),
        }}
        isEmpty={(data) => data.items.length === 0}
        emptyState={<div>vacío</div>}
      >
        {(data) => <div>{data.items.join(',')}</div>}
      </QueryWrapper>,
    )

    expect(screen.getByText('a,b')).toBeInTheDocument()
  })
})
