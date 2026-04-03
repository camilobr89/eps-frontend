import api from './api'
import type {
  Appointment,
  AppointmentFilters,
  CreateAppointmentRequest,
  PaginatedResponse,
  PaginationParams,
  UpdateAppointmentRequest,
} from '@/types'

export const appointmentsService = {
  async getAll(
    filters?: AppointmentFilters & PaginationParams,
  ): Promise<PaginatedResponse<Appointment>> {
    const response = await api.get<PaginatedResponse<Appointment>>(
      '/appointments',
      { params: filters },
    )
    return response.data
  },

  async getById(id: string): Promise<Appointment> {
    const response = await api.get<Appointment>(`/appointments/${id}`)
    return response.data
  },

  async getUpcoming(): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>('/appointments/upcoming')
    return response.data
  },

  async create(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post<Appointment>('/appointments', data)
    return response.data
  },

  async update(
    id: string,
    data: UpdateAppointmentRequest,
  ): Promise<Appointment> {
    const response = await api.put<Appointment>(`/appointments/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`)
  },
}
