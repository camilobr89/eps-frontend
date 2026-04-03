import type { FamilyMember } from './family-member.types'

export type AuthorizationStatus =
  | 'pending'
  | 'scheduled'
  | 'completed'
  | 'expired'
  | 'cancelled'

export type Priority = 'urgente' | 'alta' | 'normal' | 'baja'

export interface AuthorizationService {
  id: string
  authorization_id: string
  service_code: string
  quantity: number
  service_name: string
  service_type: string | null
}

export interface Authorization {
  id: string
  family_member_id: string
  eps_provider_id: string | null
  document_type: string
  request_number: string | null
  issuing_date: string | null
  expiration_date: string | null
  diagnosis_code: string | null
  diagnosis_description: string | null
  patient_location: string | null
  service_origin: string | null
  provider_name: string | null
  provider_nit: string | null
  provider_code: string | null
  provider_address: string | null
  provider_phone: string | null
  provider_department: string | null
  provider_city: string | null
  payment_type: string | null
  copay_value: number | null
  copay_percentage: number | null
  max_value: number | null
  weeks_contributed: number | null
  priority: Priority
  status: AuthorizationStatus
  original_file_url: string | null
  ocr_raw_text: string | null
  ocr_confidence: number | null
  ocr_parser_used: string | null
  manually_reviewed: boolean
  notes: string | null
  services: AuthorizationService[]
  family_member?: FamilyMember
  created_at: string
  updated_at: string
}

export interface CreateAuthorizationServiceRequest {
  service_code: string
  quantity?: number
  service_name: string
  service_type?: string
}

export interface CreateAuthorizationRequest {
  family_member_id: string
  eps_provider_id?: string
  document_type: string
  request_number?: string
  issuing_date?: string
  expiration_date?: string
  diagnosis_code?: string
  diagnosis_description?: string
  patient_location?: string
  service_origin?: string
  provider_name?: string
  provider_nit?: string
  provider_code?: string
  provider_address?: string
  provider_phone?: string
  provider_department?: string
  provider_city?: string
  payment_type?: string
  copay_value?: number
  copay_percentage?: number
  max_value?: number
  weeks_contributed?: number
  priority?: Priority
  notes?: string
  services: CreateAuthorizationServiceRequest[]
}

export type UpdateAuthorizationRequest = Partial<CreateAuthorizationRequest>

export interface AuthorizationFilters {
  status?: AuthorizationStatus
  priority?: Priority
  familyMemberId?: string
  expiringBefore?: string
}
