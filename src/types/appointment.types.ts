import type { Authorization } from './authorization.types'
import type { FamilyMember } from './family-member.types'

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface Appointment {
  id: string
  family_member_id: string
  authorization_id: string | null
  authorization_service_id: string | null
  appointment_date: string
  location: string | null
  doctor_name: string | null
  specialty: string | null
  notes: string | null
  status: AppointmentStatus
  reminder_sent: boolean
  authorization?: Authorization
  family_member?: FamilyMember
  created_at: string
  updated_at: string
}

export interface CreateAppointmentRequest {
  family_member_id: string
  authorization_id?: string
  authorization_service_id?: string
  appointment_date: string
  location?: string
  doctor_name?: string
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
