import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useSendReminders,
} from '../useNotifications'
import { notificationsService } from '@/services/notifications.service'
import { useNotificationsStore } from '@/stores/notifications.store'
import type { Notification, PaginatedResponse } from '@/types'

vi.mock('@/services/notifications.service', () => ({
  notificationsService: {
    getAll: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    sendReminders: vi.fn(),
  },
}))

const notification: Notification = {
  id: 'notif-1',
  title: 'OCR completado',
  message: 'La autorización ya tiene datos extraídos.',
  read: false,
  type: 'ocr_completed',
  relatedEntityType: 'authorization',
  relatedEntityId: 'auth-1',
  createdAt: '2026-04-07T12:00:00.000Z',
}

function createPage(items: Notification[]): PaginatedResponse<Notification> {
  return {
    data: items,
    meta: {
      total: items.length,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }
}

function createWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

  return {
    queryClient: client,
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children),
  }
}

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useNotificationsStore.getState().stopPolling()
    useNotificationsStore.setState({ unreadCount: 0, pollingIntervalId: null })
  })

  it('fetches notifications with read filter and pagination', async () => {
    const page = createPage([notification])
    vi.mocked(notificationsService.getAll).mockResolvedValue(page)

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useNotifications(false, { page: 2, limit: 10 }), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(page)
    expect(notificationsService.getAll).toHaveBeenCalledWith({
      read: false,
      page: 2,
      limit: 10,
    })
  })

  it('marks one notification as read and updates cached lists', async () => {
    vi.mocked(notificationsService.markAsRead).mockResolvedValue({
      ...notification,
      read: true,
    })
    vi.mocked(notificationsService.getAll).mockResolvedValue(createPage([]))

    const { queryClient, wrapper } = createWrapper()
    const allKey = ['notifications', { page: 1, limit: 20, read: undefined }]
    const unreadKey = ['notifications', { page: 1, limit: 20, read: false }]

    queryClient.setQueryData(allKey, createPage([notification]))
    queryClient.setQueryData(unreadKey, createPage([notification]))
    useNotificationsStore.setState({ unreadCount: 1 })

    const { result } = renderHook(() => useMarkAsRead(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(notification.id)
    })

    const updatedAllPage = queryClient.getQueryData<PaginatedResponse<Notification>>(allKey)
    const updatedUnreadPage = queryClient.getQueryData<PaginatedResponse<Notification>>(unreadKey)

    expect(notificationsService.markAsRead).toHaveBeenCalledWith(notification.id)
    expect(updatedAllPage?.data[0]?.read).toBe(true)
    expect(updatedUnreadPage?.data).toEqual([])
    expect(useNotificationsStore.getState().unreadCount).toBe(0)
    expect(notificationsService.getAll).toHaveBeenCalledWith({
      read: false,
      page: 1,
      limit: 1,
    })
  })

  it('marks all notifications as read and resets unread count', async () => {
    vi.mocked(notificationsService.markAllAsRead).mockResolvedValue(undefined)
    vi.mocked(notificationsService.getAll).mockResolvedValue(createPage([]))

    const { queryClient, wrapper } = createWrapper()
    const allKey = ['notifications', { page: 1, limit: 20, read: undefined }]
    const unreadKey = ['notifications', { page: 1, limit: 20, read: false }]

    queryClient.setQueryData(allKey, createPage([notification]))
    queryClient.setQueryData(unreadKey, createPage([notification]))
    useNotificationsStore.setState({ unreadCount: 3 })

    const { result } = renderHook(() => useMarkAllAsRead(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    const updatedAllPage = queryClient.getQueryData<PaginatedResponse<Notification>>(allKey)
    const updatedUnreadPage = queryClient.getQueryData<PaginatedResponse<Notification>>(unreadKey)

    expect(notificationsService.markAllAsRead).toHaveBeenCalled()
    expect(updatedAllPage?.data[0]?.read).toBe(true)
    expect(updatedUnreadPage?.data).toEqual([])
    expect(useNotificationsStore.getState().unreadCount).toBe(0)
  })

  it('sends reminders and invalidates caches', async () => {
    vi.mocked(notificationsService.sendReminders).mockResolvedValue(undefined)
    vi.mocked(notificationsService.getAll).mockResolvedValue(createPage([]))

    const { queryClient, wrapper } = createWrapper()

    queryClient.setQueryData(
      ['notifications', { page: 1, limit: 20, read: false }],
      createPage([notification]),
    )

    const { result } = renderHook(() => useSendReminders(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(notificationsService.sendReminders).toHaveBeenCalled()
    expect(notificationsService.getAll).toHaveBeenCalledWith({
      read: false,
      page: 1,
      limit: 1,
    })
  })

  it('reverts optimistic updates when markAsRead fails', async () => {
    const error = new Error('Network error')
    vi.mocked(notificationsService.markAsRead).mockRejectedValue(error)
    vi.mocked(notificationsService.getAll).mockResolvedValue(createPage([notification]))

    const { queryClient, wrapper } = createWrapper()
    const allKey = ['notifications', { page: 1, limit: 20, read: undefined }]
    const unreadKey = ['notifications', { page: 1, limit: 20, read: false }]

    queryClient.setQueryData(allKey, createPage([notification]))
    queryClient.setQueryData(unreadKey, createPage([notification]))
    useNotificationsStore.setState({ unreadCount: 1 })

    const { result } = renderHook(() => useMarkAsRead(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync(notification.id)).rejects.toThrow('Network error')
    })

    const revertedAllPage = queryClient.getQueryData<PaginatedResponse<Notification>>(allKey)
    const revertedUnreadPage = queryClient.getQueryData<PaginatedResponse<Notification>>(unreadKey)

    expect(revertedAllPage?.data[0]?.read).toBe(false)
    expect(revertedUnreadPage?.data).toEqual([notification])
    expect(useNotificationsStore.getState().unreadCount).toBe(1)
  })

  it('reverts optimistic updates when markAllAsRead fails', async () => {
    const error = new Error('Network error')
    vi.mocked(notificationsService.markAllAsRead).mockRejectedValue(error)
    const unreadPage = createPage([notification, { ...notification, id: 'notif-2' }, { ...notification, id: 'notif-3' }])
    vi.mocked(notificationsService.getAll).mockResolvedValue(unreadPage)

    const { queryClient, wrapper } = createWrapper()
    const allKey = ['notifications', { page: 1, limit: 20, read: undefined }]
    const unreadKey = ['notifications', { page: 1, limit: 20, read: false }]

    queryClient.setQueryData(allKey, createPage([notification]))
    queryClient.setQueryData(unreadKey, createPage([notification]))
    useNotificationsStore.setState({ unreadCount: 3 })

    const { result } = renderHook(() => useMarkAllAsRead(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow('Network error')
    })

    const revertedAllPage = queryClient.getQueryData<PaginatedResponse<Notification>>(allKey)
    const revertedUnreadPage = queryClient.getQueryData<PaginatedResponse<Notification>>(unreadKey)

    expect(revertedAllPage?.data[0]?.read).toBe(false)
    expect(revertedUnreadPage?.data).toEqual([notification])
    expect(useNotificationsStore.getState().unreadCount).toBe(3)
  })

  it('uses read undefined when readFilter is not provided', async () => {
    vi.mocked(notificationsService.getAll).mockResolvedValue(createPage([]))

    const { wrapper } = createWrapper()
    renderHook(() => useNotifications(), { wrapper })

    await waitFor(() => {
      expect(notificationsService.getAll).toHaveBeenCalledWith({})
    })
  })
})
