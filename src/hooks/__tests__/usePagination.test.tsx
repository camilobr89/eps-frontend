import { act, renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { usePagination } from '../usePagination'

function createWrapper(initialEntry = '/authorizations') {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  )
}

describe('usePagination', () => {
  it('reads page and limit from the URL', () => {
    const { result } = renderHook(
      () => usePagination({ totalPages: 5 }),
      { wrapper: createWrapper('/authorizations?page=2&limit=50') },
    )

    expect(result.current.page).toBe(2)
    expect(result.current.limit).toBe(50)
    expect(result.current.hasNextPage).toBe(true)
    expect(result.current.hasPreviousPage).toBe(true)
  })

  it('resets to page 1 when the limit changes', async () => {
    const { result } = renderHook(
      () => usePagination({ totalPages: 5 }),
      { wrapper: createWrapper('/authorizations?page=3&limit=20') },
    )

    act(() => {
      result.current.setLimit(10)
    })

    await waitFor(() => {
      expect(result.current.page).toBe(1)
      expect(result.current.limit).toBe(10)
    })
  })

  it('clamps the page when it exceeds total pages', async () => {
    const { result } = renderHook(
      () => usePagination({ totalPages: 2 }),
      { wrapper: createWrapper('/authorizations?page=9') },
    )

    await waitFor(() => {
      expect(result.current.page).toBe(2)
      expect(result.current.hasNextPage).toBe(false)
    })
  })
})
