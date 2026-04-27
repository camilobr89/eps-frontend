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

  it('ignores fetchUnreadCount updates when mutation is recent and total unchanged', async () => {
    vi.mocked(notificationsService.getAll).mockResolvedValue(mockUnreadResponse(5))
    useNotificationsStore.setState({
      unreadCount: 0,
      lastMutationTime: Date.now(),
      previousUnreadCount: 5,
    })

    await useNotificationsStore.getState().fetchUnreadCount()

    expect(useNotificationsStore.getState().unreadCount).toBe(0)
  })

  it('allows fetchUnreadCount update when mutation recent but total changed', async () => {
    vi.mocked(notificationsService.getAll).mockResolvedValue(mockUnreadResponse(3))
    useNotificationsStore.setState({
      unreadCount: 0,
      lastMutationTime: Date.now(),
      previousUnreadCount: 5,
    })

    await useNotificationsStore.getState().fetchUnreadCount()

    expect(useNotificationsStore.getState().unreadCount).toBe(3)
    expect(useNotificationsStore.getState().lastMutationTime).toBeNull()
    expect(useNotificationsStore.getState().previousUnreadCount).toBeNull()
  })

  it('recordMutation stores previous count and timestamp', () => {
    const before = Date.now()
    useNotificationsStore.getState().recordMutation(7)

    const state = useNotificationsStore.getState()
    expect(state.previousUnreadCount).toBe(7)
    expect(state.lastMutationTime).toBeGreaterThanOrEqual(before)
    expect(state.lastMutationTime).toBeLessThanOrEqual(Date.now())
  })

  it('fetchUnreadCount error preserves existing unreadCount', async () => {
    vi.mocked(notificationsService.getAll).mockRejectedValue(new Error('Network error'))
    useNotificationsStore.setState({ unreadCount: 3 })

    await expect(
      useNotificationsStore.getState().fetchUnreadCount(),
    ).rejects.toThrow('Network error')

    expect(useNotificationsStore.getState().unreadCount).toBe(3)
  })

  it('fetchUnreadCount updates when mutation window expired', async () => {
    vi.mocked(notificationsService.getAll).mockResolvedValue(mockUnreadResponse(5))
    useNotificationsStore.setState({
      unreadCount: 0,
      lastMutationTime: Date.now() - 15000,
      previousUnreadCount: 3,
    })

    await useNotificationsStore.getState().fetchUnreadCount()

    expect(useNotificationsStore.getState().unreadCount).toBe(5)
  })

  it('fetchUnreadCount allows update when new total is greater (new notifications)', async () => {
    vi.mocked(notificationsService.getAll).mockResolvedValue(mockUnreadResponse(8))
    useNotificationsStore.setState({
      unreadCount: 0,
      lastMutationTime: Date.now(),
      previousUnreadCount: 5,
    })

    await useNotificationsStore.getState().fetchUnreadCount()

    expect(useNotificationsStore.getState().unreadCount).toBe(8)
  })

  it('startPolling catches fetch errors without crashing', async () => {
    vi.mocked(notificationsService.getAll).mockRejectedValue(new Error('Network error'))
    useNotificationsStore.setState({ unreadCount: 2 })

    useNotificationsStore.getState().startPolling()
    await flushPromises()

    expect(useNotificationsStore.getState().unreadCount).toBe(2)
  })
})
