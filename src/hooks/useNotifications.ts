import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '@/services/notifications.service'
import { useNotificationsStore } from '@/stores/notifications.store'
import type { Notification, PaginatedResponse, PaginationParams } from '@/types'

const NOTIFICATIONS_KEY = 'notifications'
const DASHBOARD_SUMMARY_KEY = 'dashboard-summary'

type NotificationQueryParams = PaginationParams & { read?: boolean }

interface NotificationMutationContext {
  previousQueries: Array<
    [readonly unknown[], PaginatedResponse<Notification> | undefined]
  >
  previousUnreadCount: number
}

function getNotificationsQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.getQueriesData<PaginatedResponse<Notification>>({
    queryKey: [NOTIFICATIONS_KEY],
  })
}

function updateNotificationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (
    current: PaginatedResponse<Notification>,
    params?: NotificationQueryParams,
  ) => PaginatedResponse<Notification>,
) {
  for (const [queryKey, current] of getNotificationsQueries(queryClient)) {
    if (!current) continue

    const params = queryKey[1] as NotificationQueryParams | undefined
    queryClient.setQueryData<PaginatedResponse<Notification>>(
      queryKey,
      updater(current, params),
    )
  }
}

export function useNotifications(
  readFilter?: boolean,
  pagination: PaginationParams = {},
) {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, { ...pagination, read: readFilter }],
    queryFn: () =>
      notificationsService.getAll({
        ...pagination,
        ...(readFilter !== undefined ? { read: readFilter } : {}),
      }),
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation<
    Notification,
    Error,
    string,
    NotificationMutationContext
  >({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_KEY] })

      const previousQueries = getNotificationsQueries(queryClient)
      const previousUnreadCount = useNotificationsStore.getState().unreadCount
      const wasUnread = previousQueries.some(([, page]) =>
        page?.data.some((notification) => notification.id === id && !notification.read),
      )

      updateNotificationQueries(queryClient, (current, params) => {
        if (params?.read === false) {
          const nextData = current.data.filter((notification) => notification.id !== id)
          const nextTotal = Math.max(0, current.meta.total - (wasUnread ? 1 : 0))
          const nextTotalPages =
            current.meta.limit > 0
              ? Math.max(1, Math.ceil(nextTotal / current.meta.limit))
              : current.meta.totalPages

          return {
            data: nextData,
            meta: {
              ...current.meta,
              total: nextTotal,
              totalPages: nextTotalPages,
              hasNextPage: current.meta.page < nextTotalPages,
              hasPreviousPage: current.meta.page > 1,
            },
          }
        }

        return {
          ...current,
          data: current.data.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification,
          ),
        }
      })

      if (wasUnread) {
        useNotificationsStore.setState({
          unreadCount: Math.max(0, previousUnreadCount - 1),
        })
      }

      return { previousQueries, previousUnreadCount }
    },
    onError: (_error, _id, context) => {
      if (!context) return

      for (const [queryKey, previous] of context.previousQueries) {
        queryClient.setQueryData(queryKey, previous)
      }

      useNotificationsStore.setState({ unreadCount: context.previousUnreadCount })
    },
    onSuccess: (notification) => {
      updateNotificationQueries(queryClient, (current) => ({
        ...current,
        data: current.data.map((item) =>
          item.id === notification.id ? { ...item, ...notification, read: true } : item,
        ),
      }))
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] })
      await queryClient.invalidateQueries({ queryKey: [DASHBOARD_SUMMARY_KEY] })
      await useNotificationsStore.getState().fetchUnreadCount().catch(() => undefined)
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, void, NotificationMutationContext>({
    mutationFn: () => notificationsService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_KEY] })

      const previousQueries = getNotificationsQueries(queryClient)
      const previousUnreadCount = useNotificationsStore.getState().unreadCount

      updateNotificationQueries(queryClient, (current, params) => {
        if (params?.read === false) {
          return {
            data: [],
            meta: {
              ...current.meta,
              total: 0,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          }
        }

        return {
          ...current,
          data: current.data.map((notification) => ({ ...notification, read: true })),
        }
      })

      useNotificationsStore.setState({ unreadCount: 0 })

      return { previousQueries, previousUnreadCount }
    },
    onError: (_error, _variables, context) => {
      if (!context) return

      for (const [queryKey, previous] of context.previousQueries) {
        queryClient.setQueryData(queryKey, previous)
      }

      useNotificationsStore.setState({ unreadCount: context.previousUnreadCount })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] })
      await queryClient.invalidateQueries({ queryKey: [DASHBOARD_SUMMARY_KEY] })
      await useNotificationsStore.getState().fetchUnreadCount().catch(() => undefined)
    },
  })
}
