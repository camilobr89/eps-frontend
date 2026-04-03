import api from './api'
import type { Notification, PaginatedResponse, PaginationParams } from '@/types'

export const notificationsService = {
  async getAll(
    params?: PaginationParams & { read?: boolean },
  ): Promise<PaginatedResponse<Notification>> {
    const response = await api.get<PaginatedResponse<Notification>>(
      '/notifications',
      { params },
    )
    return response.data
  },

  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all')
  },
}
