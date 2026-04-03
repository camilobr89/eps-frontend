export interface ExpiringAuthorization {
  id: string
  requestNumber: string
  expirationDate: string
  daysLeft: number
}

export interface DashboardSummary {
  totalAuthorizations: number
  pendingAuthorizations: number
  upcomingAppointments: number
  unreadNotifications: number
  expiringAuthorizations: ExpiringAuthorization[]
}

export interface TimelineEvent {
  type: 'appointment' | 'expiration'
  title: string
  description: string
  date: string
  entityId: string
}
