import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { NotificationsPage } from '../NotificationsPage'
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from '@/hooks/useNotifications'
import { useNotificationsStore } from '@/stores/notifications.store'
import type { Notification, PaginatedResponse } from '@/types'

const mockNavigate = vi.fn()
const mockMarkAsRead = vi.fn()
const mockMarkAllAsRead = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
  useMarkAsRead: vi.fn(),
  useMarkAllAsRead: vi.fn(),
}))

const notifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'OCR completado',
    message: 'La autorización fue actualizada',
    read: false,
    type: 'ocr_completed',
    relatedEntityType: 'authorization',
    relatedEntityId: 'auth-1',
    createdAt: '2026-04-07T11:55:00.000-05:00',
  },
  {
    id: 'notif-2',
    title: 'Recordatorio de cita',
    message: 'Consulta con medicina interna',
    read: true,
    type: 'appointment_reminder',
    relatedEntityType: 'appointment',
    relatedEntityId: 'appt-1',
    createdAt: '2026-04-06T12:00:00.000-05:00',
  },
]

function mockPage(items: Notification[], hasNextPage = false): PaginatedResponse<Notification> {
  return {
    data: items,
    meta: {
      total: items.length,
      page: 1,
      limit: 20,
      totalPages: hasNextPage ? 2 : 1,
      hasNextPage,
      hasPreviousPage: false,
    },
  }
}

describe('NotificationsPage', () => {
  function renderPage(initialEntry = '/notifications') {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <NotificationsPage />
      </MemoryRouter>,
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useNotificationsStore.setState({ unreadCount: 1, pollingIntervalId: null })

    vi.mocked(useNotifications).mockReturnValue({
      data: mockPage(notifications, true),
      isLoading: false,
      isFetching: false,
      isError: false,
    } as unknown as ReturnType<typeof useNotifications>)

    vi.mocked(useMarkAsRead).mockReturnValue({
      mutateAsync: mockMarkAsRead,
      isPending: false,
    } as unknown as ReturnType<typeof useMarkAsRead>)

    vi.mocked(useMarkAllAsRead).mockReturnValue({
      mutateAsync: mockMarkAllAsRead,
      isPending: false,
    } as unknown as ReturnType<typeof useMarkAllAsRead>)
  })

  it('renders notifications and marks one as read before navigating', async () => {
    const user = userEvent.setup()
    mockMarkAsRead.mockResolvedValue(undefined)

    renderPage()

    expect(screen.getByRole('heading', { name: 'Notificaciones' })).toBeInTheDocument()
    expect(screen.getByText('OCR completado')).toBeInTheDocument()
    expect(screen.getByText('Recordatorio de cita')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ocr completado/i }))

    expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1')
    expect(mockNavigate).toHaveBeenCalledWith('/authorizations/auth-1')
  })

  it('changes the filter, marks all as read, and requests more items', async () => {
    const user = userEvent.setup()
    mockMarkAllAsRead.mockResolvedValue(undefined)

    renderPage()

    await user.click(screen.getByRole('button', { name: 'No leídas' }))
    expect(useNotifications).toHaveBeenLastCalledWith(false, { page: 1, limit: 20 })

    await user.click(screen.getByRole('button', { name: /marcar todas como leídas/i }))
    expect(mockMarkAllAsRead).toHaveBeenCalled()

    await user.selectOptions(screen.getByLabelText('Por página'), '50')
    await waitFor(() => {
      expect(useNotifications).toHaveBeenLastCalledWith(false, { page: 1, limit: 50 })
    })
  })
})
