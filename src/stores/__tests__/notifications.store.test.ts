import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { notificationsService } from '@/services/notifications.service'
import { useNotificationsStore } from '../notifications.store'

vi.mock('@/services/notifications.service', () => ({
  notificationsService: {
    getAll: vi.fn(),
  },
}))

function mockUnreadResponse(total: number) {
  return {
    data: [],
    meta: {
      total,
      page: 1,
      limit: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }
}

async function flushPromises() {
  await Promise.resolve()
}

describe('notifications.store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    useNotificationsStore.getState().stopPolling()
    useNotificationsStore.setState({ unreadCount: 0, pollingIntervalId: null })
  })

  afterEach(() => {
    useNotificationsStore.getState().stopPolling()
    vi.useRealTimers()
  })

  it('fetchUnreadCount updates the unread total', async () => {
    vi.mocked(notificationsService.getAll).mockResolvedValue(mockUnreadResponse(4))

    await useNotificationsStore.getState().fetchUnreadCount()

    expect(notificationsService.getAll).toHaveBeenCalledWith({
      read: false,
      page: 1,
      limit: 1,
    })
    expect(useNotificationsStore.getState().unreadCount).toBe(4)
  })

  it('startPolling fetches immediately and every 60 seconds', async () => {
    vi.mocked(notificationsService.getAll)
      .mockResolvedValueOnce(mockUnreadResponse(4))
      .mockResolvedValueOnce(mockUnreadResponse(2))

    useNotificationsStore.getState().startPolling()
    await flushPromises()

    expect(useNotificationsStore.getState().unreadCount).toBe(4)

    await vi.advanceTimersByTimeAsync(60_000)
    await flushPromises()

    expect(useNotificationsStore.getState().unreadCount).toBe(2)
  })

  it('stopPolling clears the interval', async () => {
    vi.mocked(notificationsService.getAll).mockResolvedValue(mockUnreadResponse(1))

    useNotificationsStore.getState().startPolling()
    await flushPromises()

    expect(notificationsService.getAll).toHaveBeenCalledTimes(1)

    useNotificationsStore.getState().stopPolling()
    await vi.advanceTimersByTimeAsync(60_000)
    await flushPromises()

    expect(notificationsService.getAll).toHaveBeenCalledTimes(1)
    expect(useNotificationsStore.getState().pollingIntervalId).toBeNull()
  })
})
