import type { Authorization } from './authorization.types'
import type { FamilyMember } from './family-member.types'

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export interface Appointment {
  id: string
  familyMemberId: string
  authorizationId: string | null
  authorizationServiceId: string | null
  appointmentDate: string
  location: string | null
  doctorName: string | null
  specialty: string | null
  notes: string | null
  status: AppointmentStatus
  authorization?: Authorization
  familyMember?: FamilyMember
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentRequest {
  familyMemberId: string
  authorizationId?: string
  authorizationServiceId?: string
  appointmentDate: string
  location?: string
  doctorName?: string
  specialty?: string
  notes?: string
}

export interface UpdateAppointmentRequest
  extends Partial<CreateAppointmentRequest> {
  status?: AppointmentStatus
}

export interface AppointmentFilters {
  dateFrom?: string
  dateTo?: string
  status?: AppointmentStatus
  familyMemberId?: string
}
