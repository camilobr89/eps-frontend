import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useDashboardSummary, useDashboardTimeline } from '../useDashboard'
import { dashboardService } from '@/services/dashboard.service'
import type { DashboardSummary } from '@/types'

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getSummary: vi.fn(),
    getTimeline: vi.fn(),
  },
}))

const mockSummary = {
  totalAuthorizations: 5,
  pendingAuthorizations: 2,
  upcomingAppointments: 3,
  unreadNotifications: 1,
  expiringAuthorizations: [
    {
      id: 'auth-1',
      requestNumber: 'AUTH-001',
      expirationDate: '2026-04-10T00:00:00.000Z',
      daysLeft: 4,
    },
  ],
}

const mockTimeline = [
  {
    type: 'appointment' as const,
    title: 'Cita cardiologia',
    description: 'Consulta con especialista',
    date: '2026-04-10T14:00:00.000Z',
    entityId: 'appt-1',
  },
  {
    type: 'expiration' as const,
    title: 'Autorizacion por vencer',
    description: 'AUTH-001 vence pronto',
    date: '2026-04-12T23:59:59.000Z',
    entityId: 'auth-1',
  },
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

describe('useDashboardSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch dashboard summary', async () => {
    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary)

    const { result } = renderHook(() => useDashboardSummary(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockSummary)
    expect(dashboardService.getSummary).toHaveBeenCalled()
  })

  it('should handle fetch error', async () => {
    vi.mocked(dashboardService.getSummary).mockRejectedValue(new Error('Network'))

    const { result } = renderHook(() => useDashboardSummary(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Network')
  })

  it('should normalize missing expiring authorizations', async () => {
    vi.mocked(dashboardService.getSummary).mockResolvedValue({
      ...mockSummary,
      expiringAuthorizations: undefined as unknown as DashboardSummary['expiringAuthorizations'],
    })

    const { result } = renderHook(() => useDashboardSummary(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.expiringAuthorizations).toEqual([])
  })

  it('should normalize count-items summary payloads', async () => {
    vi.mocked(dashboardService.getSummary).mockResolvedValue({
      totalAuthorizations: { count: 5, items: [] },
      pendingAuthorizations: { count: 2, items: [] },
      upcomingAppointments: { count: 3, items: [] },
      unreadNotifications: { count: 1, items: [] },
      expiringAuthorizations: {
        count: 1,
        items: [
          {
            id: 'auth-1',
            requestNumber: 'AUTH-001',
            expirationDate: '2026-04-10T00:00:00.000Z',
            daysLeft: 4,
          },
        ],
      },
    } as unknown as DashboardSummary)

    const { result } = renderHook(() => useDashboardSummary(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      totalAuthorizations: 5,
      pendingAuthorizations: 2,
      upcomingAppointments: 3,
      unreadNotifications: 1,
      expiringAuthorizations: [
        {
          id: 'auth-1',
          requestNumber: 'AUTH-001',
          expirationDate: '2026-04-10T00:00:00.000Z',
          daysLeft: 4,
        },
      ],
    })
  })
})

describe('useDashboardTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch dashboard timeline', async () => {
    vi.mocked(dashboardService.getTimeline).mockResolvedValue(mockTimeline)

    const { result } = renderHook(() => useDashboardTimeline(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockTimeline)
    expect(dashboardService.getTimeline).toHaveBeenCalled()
  })

  it('should handle timeline fetch error', async () => {
    vi.mocked(dashboardService.getTimeline).mockRejectedValue(new Error('Network'))

    const { result } = renderHook(() => useDashboardTimeline(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Network')
  })

  it('should normalize invalid timeline payloads', async () => {
    vi.mocked(dashboardService.getTimeline).mockResolvedValue(undefined as unknown as typeof mockTimeline)

    const { result } = renderHook(() => useDashboardTimeline(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('should normalize count-items timeline payloads', async () => {
    vi.mocked(dashboardService.getTimeline).mockResolvedValue({
      count: 2,
      items: mockTimeline,
    } as unknown as typeof mockTimeline)

    const { result } = renderHook(() => useDashboardTimeline(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockTimeline)
  })
})
