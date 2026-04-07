import api from './api'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateUserPreferencesRequest,
  User,
} from '@/types'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<User>('/auth/register', data)
    return response.data
  },

  async refresh(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh')
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile')
    return response.data
  },

  async updatePreferences(data: UpdateUserPreferencesRequest): Promise<void> {
    await api.put('/auth/preferences', data)
  },
}
