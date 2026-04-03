import type { Appointment } from './appointment.types'
import type { Authorization } from './authorization.types'

export interface DashboardFamilyMember {
  id: string
  name: string
  epsName: string
  pendingCount: number
  nextAppointment: string | null
}

export interface DashboardSummary {
  urgent: {
    count: number
    items: Authorization[]
  }
  expiringSoon: {
    count: number
    items: Authorization[]
  }
  pendingToSchedule: {
    count: number
    items: Authorization[]
  }
  upcomingAppointments: {
    count: number
    items: Appointment[]
  }
  familyMembers: DashboardFamilyMember[]
}

export interface TimelineEvent {
  type: 'appointment' | 'expiration'
  date: string
  description: string
  entityId: string
  familyMemberName: string
}
