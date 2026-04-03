import api from './api'
import type {
  CreateFamilyMemberRequest,
  FamilyMember,
  PaginatedResponse,
  PaginationParams,
  UpdateFamilyMemberRequest,
} from '@/types'

export const familyMembersService = {
  async getAll(
    params?: PaginationParams,
  ): Promise<PaginatedResponse<FamilyMember>> {
    const response = await api.get<PaginatedResponse<FamilyMember>>(
      '/family-members',
      { params },
    )
    return response.data
  },

  async getById(id: string): Promise<FamilyMember> {
    const response = await api.get<FamilyMember>(`/family-members/${id}`)
    return response.data
  },

  async create(data: CreateFamilyMemberRequest): Promise<FamilyMember> {
    const response = await api.post<FamilyMember>('/family-members', data)
    return response.data
  },

  async update(
    id: string,
    data: UpdateFamilyMemberRequest,
  ): Promise<FamilyMember> {
    const response = await api.put<FamilyMember>(`/family-members/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/family-members/${id}`)
  },
}
