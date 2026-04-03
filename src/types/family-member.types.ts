import type { EpsProvider } from './eps-provider.types'

export type DocumentType = 'CC' | 'TI' | 'RC' | 'CE' | 'PA'

export type Relationship = string

export interface FamilyMember {
  id: string
  userId: string
  epsProviderId: string
  fullName: string
  documentType: DocumentType
  documentNumber: string
  birthDate: string
  address: string | null
  phone: string | null
  cellphone: string | null
  email: string | null
  department: string | null
  city: string | null
  regime: string | null
  relationship: Relationship
  epsProvider?: EpsProvider
  createdAt: string
  updatedAt: string
}

export interface CreateFamilyMemberRequest {
  epsProviderId?: string
  fullName: string
  documentType?: DocumentType
  documentNumber?: string
  birthDate?: string
  address?: string
  phone?: string
  cellphone?: string
  email?: string
  department?: string
  city?: string
  regime?: string
  relationship: string
}

export type UpdateFamilyMemberRequest = Partial<CreateFamilyMemberRequest>
