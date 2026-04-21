import api from './api'
import type { Notification, PaginatedResponse, PaginationParams } from '@/types'

type NotificationsApiResponse =
  | PaginatedResponse<Notification>
  | {
      items?: Notification[]
      total?: number
      page?: number
      limit?: number
      totalPages?: number
    }

function normalizeNotification(notification: Notification): Notification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    type: notification.type ?? null,
    relatedEntityType: notification.relatedEntityType ?? null,
    relatedEntityId: notification.relatedEntityId ?? null,
    createdAt:
      notification.createdAt ??
      (notification as Notification & { sentAt?: string }).sentAt ??
      notification.updatedAt ??
      new Date(0).toISOString(),
    updatedAt: notification.updatedAt,
  }
}

function normalizePaginatedResponse(
  response: NotificationsApiResponse,
): PaginatedResponse<Notification> {
  if ('data' in response && 'meta' in response) {
    return {
      data: response.data.map(normalizeNotification),
      meta: response.meta,
    }
  }

  const total = response.total ?? response.items?.length ?? 0
  const page = response.page ?? 1
  const limit = response.limit ?? response.items?.length ?? 20
  const totalPages =
    response.totalPages ?? (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1)

  return {
    data: (response.items ?? []).map(normalizeNotification),
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }
}

export const notificationsService = {
  async getAll(
    params?: PaginationParams & { read?: boolean },
  ): Promise<PaginatedResponse<Notification>> {
    const response = await api.get<NotificationsApiResponse>(
      '/notifications',
      { params },
    )
    console.debug('notificationsService.getAll', { params, response: response.data })
    return normalizePaginatedResponse(response.data)
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put<Notification>(`/notifications/${id}/read`)
    console.debug('notificationsService.markAsRead', { id, response: response.data })
    return normalizeNotification(response.data)
  },

  async markAllAsRead(): Promise<void> {
    console.debug('notificationsService.markAllAsRead')
    await api.put('/notifications/read-all')
  },
}
