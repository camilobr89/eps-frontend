import { create } from 'zustand'
import { notificationsService } from '@/services/notifications.service'

interface NotificationsState {
  unreadCount: number
  pollingIntervalId: number | null
  lastMutationTime: number | null
  previousUnreadCount: number | null
  fetchUnreadCount: () => Promise<number>
  startPolling: () => void
  stopPolling: () => void
  recordMutation: (previousUnreadCount: number) => void
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  unreadCount: 0,
  pollingIntervalId: null,
  lastMutationTime: null,
  previousUnreadCount: null,
  recordMutation: (previousUnreadCount) => {
    set({ previousUnreadCount, lastMutationTime: Date.now() })
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationsService.getAll({ read: false, page: 1, limit: 1 })
      const newTotal = response.meta.total
      const current = get().unreadCount
      const { lastMutationTime, previousUnreadCount } = get()
      const now = Date.now()
      console.debug('fetchUnreadCount:', { current, newTotal, lastMutationTime, previousUnreadCount })
      
      let shouldUpdate = true
      if (lastMutationTime !== null && previousUnreadCount !== null && (now - lastMutationTime < 10000)) {
        if (newTotal === previousUnreadCount) {
          shouldUpdate = false
          console.debug('Ignoring update because mutation recently and total unchanged (backend likely not processed)')
        } else {
          console.debug('Allowing update because total changed:', { diff: newTotal - previousUnreadCount })
        }
      }
      
      if (shouldUpdate) {
        set({ unreadCount: newTotal, lastMutationTime: null, previousUnreadCount: null })
      }
      return newTotal
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
      throw error
    }
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
