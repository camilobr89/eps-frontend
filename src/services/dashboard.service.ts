import api from './api'
import type { DashboardSummary, TimelineEvent } from '@/types'

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>('/dashboard/summary')
    return response.data
  },

  async getTimeline(): Promise<TimelineEvent[]> {
    const response = await api.get<TimelineEvent[]>('/dashboard/timeline')
    return response.data
  },
}
