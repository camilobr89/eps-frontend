import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardPage } from '../DashboardPage'
import { useDashboardSummary, useDashboardTimeline } from '@/hooks/useDashboard'
import type { DashboardSummary, TimelineEvent } from '@/types'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/hooks/useDashboard', () => ({
  useDashboardSummary: vi.fn(),
  useDashboardTimeline: vi.fn(),
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
      daysLeft: 2,
    },
  ],
}

const mockTimeline = [
  {
    type: 'appointment' as const,
    title: 'Cita médica',
    description: 'Consulta con especialista',
    date: '2026-04-10T14:00:00.000Z',
    entityId: 'appt-1',
  },
  {
    type: 'expiration' as const,
    title: 'Autorización por vencer',
    description: 'AUTH-001 vence en 2 días',
    date: '2026-04-12T23:59:59.000Z',
    entityId: 'auth-1',
  },
]

function mockSummaryResult(data: DashboardSummary) {
  return {
    data,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useDashboardSummary>
}

function mockTimelineResult(data: TimelineEvent[]) {
  return {
    data,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useDashboardTimeline>
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useDashboardSummary).mockReturnValue(mockSummaryResult(mockSummary))
    vi.mocked(useDashboardTimeline).mockReturnValue(mockTimelineResult(mockTimeline))
  })

  it('should render summary values and dashboard sections', () => {
    render(<DashboardPage />)

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Total autorizaciones')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Autorizaciones por vencer')).toBeInTheDocument()
    expect(screen.getByText('Timeline')).toBeInTheDocument()
    expect(screen.getByText('AUTH-001')).toBeInTheDocument()
    expect(screen.getByText('Cita médica')).toBeInTheDocument()
  })

  it('should navigate from summary cards and timeline events', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    await user.click(screen.getByRole('button', { name: /total autorizaciones/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/authorizations')

    await user.click(screen.getByRole('button', { name: /pendientes/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/authorizations?status=pending')

    await user.click(screen.getByRole('button', { name: /cita médica/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/appointments/appt-1')

    await user.click(screen.getByRole('button', { name: /autorización por vencer/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/authorizations/auth-1')
  })

  it('should show friendly empty states when summary sections are empty', () => {
    vi.mocked(useDashboardSummary).mockReturnValue(mockSummaryResult({
      ...mockSummary,
      expiringAuthorizations: [],
    }))

    vi.mocked(useDashboardTimeline).mockReturnValue(mockTimelineResult([]))

    render(<DashboardPage />)

    expect(screen.getByText('Sin vencimientos cercanos')).toBeInTheDocument()
    expect(screen.getByText('Sin eventos próximos')).toBeInTheDocument()
  })
})
