import type { EpsProvider } from './eps-provider.types'

export type DocumentType = 'CC' | 'TI' | 'RC' | 'CE' | 'PA'

export type Relationship = 'titular' | 'conyuge' | 'hijo' | 'padre'

export interface FamilyMember {
  id: string
  user_id: string
  eps_provider_id: string
  full_name: string
  document_type: DocumentType
  document_number: string
  birth_date: string
  address: string | null
  phone: string | null
  cellphone: string | null
  email: string | null
  department: string | null
  city: string | null
  regime: string | null
  relationship: Relationship
  eps_provider?: EpsProvider
  created_at: string
  updated_at: string
}

export interface CreateFamilyMemberRequest {
  eps_provider_id: string
  full_name: string
  document_type: DocumentType
  document_number: string
  birth_date: string
  address?: string
  phone?: string
  cellphone?: string
  email?: string
  department?: string
  city?: string
  regime?: string
  relationship: Relationship
}

export type UpdateFamilyMemberRequest = Partial<CreateFamilyMemberRequest>
