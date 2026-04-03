import api from './api'
import type {
  Authorization,
  AuthorizationFilters,
  CreateAuthorizationRequest,
  PaginatedResponse,
  PaginationParams,
  UpdateAuthorizationRequest,
} from '@/types'

export const authorizationsService = {
  async getAll(
    filters?: AuthorizationFilters & PaginationParams,
  ): Promise<PaginatedResponse<Authorization>> {
    const response = await api.get<PaginatedResponse<Authorization>>(
      '/authorizations',
      { params: filters },
    )
    return response.data
  },

  async getById(id: string): Promise<Authorization> {
    const response = await api.get<Authorization>(`/authorizations/${id}`)
    return response.data
  },

  async create(data: CreateAuthorizationRequest): Promise<Authorization> {
    const response = await api.post<Authorization>('/authorizations', data)
    return response.data
  },

  async update(
    id: string,
    data: UpdateAuthorizationRequest,
  ): Promise<Authorization> {
    const response = await api.put<Authorization>(
      `/authorizations/${id}`,
      data,
    )
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/authorizations/${id}`)
  },
}
