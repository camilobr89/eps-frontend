import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard.service'
import type { DashboardSummary, TimelineEvent } from '@/types'

const DASHBOARD_SUMMARY_KEY = 'dashboard-summary'
const DASHBOARD_TIMELINE_KEY = 'dashboard-timeline'

function extractCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (value && typeof value === 'object' && 'count' in value) {
    const count = (value as { count?: unknown }).count
    if (typeof count === 'number' && Number.isFinite(count)) {
      return count
    }
  }

  return 0
}

function extractItems<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[]
  }

  if (value && typeof value === 'object' && 'items' in value) {
    const items = (value as { items?: unknown }).items
    if (Array.isArray(items)) {
      return items as T[]
    }
  }

  return []
}

function normalizeSummary(summary: unknown): DashboardSummary {
  const data = (summary ?? {}) as Record<string, unknown>

  return {
    totalAuthorizations: extractCount(data.totalAuthorizations),
    pendingAuthorizations: extractCount(data.pendingAuthorizations),
    upcomingAppointments: extractCount(data.upcomingAppointments),
    unreadNotifications: extractCount(data.unreadNotifications),
    expiringAuthorizations: extractItems(data.expiringAuthorizations),
  }
}

function normalizeTimeline(timeline: unknown): TimelineEvent[] {
  return extractItems<TimelineEvent>(timeline)
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: [DASHBOARD_SUMMARY_KEY],
    queryFn: async () => normalizeSummary(await dashboardService.getSummary()),
    staleTime: 2 * 60 * 1000,
  })
}

export function useDashboardTimeline() {
  return useQuery({
    queryKey: [DASHBOARD_TIMELINE_KEY],
    queryFn: async () => normalizeTimeline(await dashboardService.getTimeline()),
  })
}
