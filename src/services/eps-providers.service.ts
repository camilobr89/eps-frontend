import api from './api'
import type { EpsProvider } from '@/types'

export const epsProvidersService = {
  async getAll(): Promise<EpsProvider[]> {
    const response = await api.get<EpsProvider[]>('/eps-providers')
    return response.data
  },

  async getById(id: string): Promise<EpsProvider> {
    const response = await api.get<EpsProvider>(`/eps-providers/${id}`)
    return response.data
  },
}
