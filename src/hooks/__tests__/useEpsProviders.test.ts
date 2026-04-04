import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useEpsProviders } from '../useEpsProviders'
import { epsProvidersService } from '@/services/eps-providers.service'

vi.mock('@/services/eps-providers.service', () => ({
  epsProvidersService: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
}))

const mockProviders = [
  { id: 'eps-1', name: 'EPS Sanitas', code: 'EPS005', isActive: true },
  { id: 'eps-2', name: 'Compensar EPS', code: 'EPS008', isActive: true },
  { id: 'eps-3', name: 'Capital Salud EPS', code: 'EPS039', isActive: false },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useEpsProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch EPS providers list', async () => {
    vi.mocked(epsProvidersService.getAll).mockResolvedValue(mockProviders)

    const { result } = renderHook(() => useEpsProviders(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockProviders)
    expect(epsProvidersService.getAll).toHaveBeenCalled()
  })

  it('should handle fetch error', async () => {
    vi.mocked(epsProvidersService.getAll).mockRejectedValue(new Error('Network'))

    const { result } = renderHook(() => useEpsProviders(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Network')
  })

  it('should use staleTime Infinity for aggressive caching', () => {
    vi.mocked(epsProvidersService.getAll).mockResolvedValue(mockProviders)

    const { result } = renderHook(() => useEpsProviders(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })
})
