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
  authorizationId: string
  serviceCode: string
  quantity: number
  serviceName: string
  serviceType: string | null
}

export type DocumentOcrStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface AuthorizationDocument {
  id: string
  authorizationId: string
  fileName: string
  fileSize: number
  mimeType: string | null
  fileUrl: string | null
  ocrStatus: DocumentOcrStatus
  ocrError: string | null
  ocrCompletedAt: string | null
  createdAt: string
  updatedAt?: string
}

export interface Authorization {
  id: string
  familyMemberId: string
  epsProviderId: string | null
  documentType: string
  requestNumber: string | null
  issuingDate: string | null
  expirationDate: string | null
  diagnosisCode: string | null
  diagnosisDescription: string | null
  patientLocation: string | null
  serviceOrigin: string | null
  providerName: string | null
  providerNit: string | null
  providerCode: string | null
  providerAddress: string | null
  providerPhone: string | null
  providerDepartment: string | null
  providerCity: string | null
  paymentType: string | null
  copayValue: number | null
  copayPercentage: number | null
  maxValue: number | null
  weeksContributed: number | null
  priority: Priority
  status: AuthorizationStatus
  originalFileUrl: string | null
  ocrRawText: string | null
  ocrConfidence: number | null
  ocrParserUsed: string | null
  manuallyReviewed: boolean
  notes: string | null
  services: AuthorizationService[]
  documents?: AuthorizationDocument[]
  familyMember?: FamilyMember
  createdAt: string
  updatedAt: string
}

export interface CreateAuthorizationServiceRequest {
  serviceCode: string
  quantity?: number
  serviceName: string
  serviceType?: string
}

export interface CreateAuthorizationRequest {
  familyMemberId: string
  epsProviderId?: string
  documentType: string
  requestNumber?: string
  issuingDate?: string
  expirationDate?: string
  diagnosisCode?: string
  diagnosisDescription?: string
  patientLocation?: string
  serviceOrigin?: string
  providerName?: string
  providerNit?: string
  providerCode?: string
  providerAddress?: string
  providerPhone?: string
  providerDepartment?: string
  providerCity?: string
  paymentType?: string
  copayValue?: number
  copayPercentage?: number
  maxValue?: number
  weeksContributed?: number
  priority?: Priority
  notes?: string
  services?: CreateAuthorizationServiceRequest[]
}

export type UpdateAuthorizationRequest = Partial<CreateAuthorizationRequest> & {
  manuallyReviewed?: boolean
}

export interface AuthorizationFilters {
  status?: AuthorizationStatus
  priority?: Priority
  familyMemberId?: string
  expiringBefore?: string
}
