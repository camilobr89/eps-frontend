import { create } from 'zustand'
import { notificationsService } from '@/services/notifications.service'

interface NotificationsState {
  unreadCount: number
  pollingIntervalId: number | null
  fetchUnreadCount: () => Promise<number>
  startPolling: () => void
  stopPolling: () => void
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  unreadCount: 0,
  pollingIntervalId: null,

  fetchUnreadCount: async () => {
    const response = await notificationsService.getAll({ read: false, page: 1, limit: 1 })
    const unreadCount = response.meta.total
    set({ unreadCount })
    return unreadCount
  },

  startPolling: () => {
    get().stopPolling()

    void get().fetchUnreadCount().catch(() => {
      // Preserve the last known count if the refresh fails.
    })

    const pollingIntervalId = window.setInterval(() => {
      void get().fetchUnreadCount().catch(() => {
        // Preserve the last known count if the refresh fails.
      })
    }, 60_000)

    set({ pollingIntervalId })
  },

  stopPolling: () => {
    const pollingIntervalId = get().pollingIntervalId
    if (pollingIntervalId !== null) {
      window.clearInterval(pollingIntervalId)
      set({ pollingIntervalId: null })
    }
  },
}))
