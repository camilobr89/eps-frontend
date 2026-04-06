import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsService } from '@/services/appointments.service'
import type {
  AppointmentFilters,
  CreateAppointmentRequest,
  PaginationParams,
  UpdateAppointmentRequest,
} from '@/types'

const APPOINTMENTS_KEY = 'appointments'
const AUTHORIZATIONS_KEY = 'authorizations'

export function useAppointments(filters?: AppointmentFilters & PaginationParams) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, filters],
    queryFn: () => appointmentsService.getAll(filters),
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, id],
    queryFn: () => appointmentsService.getById(id),
    enabled: !!id,
  })
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, 'upcoming'],
    queryFn: () => appointmentsService.getUpcoming(),
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => appointmentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] })
      queryClient.invalidateQueries({ queryKey: [AUTHORIZATIONS_KEY] })
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentRequest }) =>
      appointmentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] })
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => appointmentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] })
      queryClient.invalidateQueries({ queryKey: [AUTHORIZATIONS_KEY] })
    },
  })
}
