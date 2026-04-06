import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  useAppointments,
  useAppointment,
  useUpcomingAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from '../useAppointments'
import { appointmentsService } from '@/services/appointments.service'

vi.mock('@/services/appointments.service', () => ({
  appointmentsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getUpcoming: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockAppointment = {
  id: 'appt-1',
  familyMemberId: 'member-1',
  authorizationId: 'auth-1',
  authorizationServiceId: 'service-1',
  appointmentDate: '2026-04-10T14:00:00.000Z',
  location: 'Clinica Central',
  doctorName: 'Dra. Ana Torres',
  specialty: 'Cardiologia',
  notes: 'Ayuno previo',
  status: 'scheduled' as const,
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-01T00:00:00Z',
}

const mockPaginatedResponse = {
  data: [mockAppointment],
  meta: {
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)

  return { wrapper, invalidateQueriesSpy }
}

describe('useAppointments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch appointments list', async () => {
    vi.mocked(appointmentsService.getAll).mockResolvedValue(mockPaginatedResponse)

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAppointments(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPaginatedResponse)
    expect(appointmentsService.getAll).toHaveBeenCalledWith(undefined)
  })

  it('should pass filters to the service', async () => {
    vi.mocked(appointmentsService.getAll).mockResolvedValue(mockPaginatedResponse)

    const filters = {
      dateFrom: '2026-04-01',
      dateTo: '2026-04-30',
      status: 'confirmed' as const,
      familyMemberId: 'member-1',
      page: 2,
      limit: 10,
    }

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAppointments(filters), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(appointmentsService.getAll).toHaveBeenCalledWith(filters)
  })

  it('should handle fetch error', async () => {
    vi.mocked(appointmentsService.getAll).mockRejectedValue(new Error('Network'))

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAppointments(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Network')
  })
})

describe('useAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single appointment by id', async () => {
    vi.mocked(appointmentsService.getById).mockResolvedValue(mockAppointment)

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAppointment('appt-1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockAppointment)
    expect(appointmentsService.getById).toHaveBeenCalledWith('appt-1')
  })

  it('should not fetch when id is empty', () => {
    const { wrapper } = createWrapper()

    renderHook(() => useAppointment(''), { wrapper })

    expect(appointmentsService.getById).not.toHaveBeenCalled()
  })
})

describe('useUpcomingAppointments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch upcoming appointments', async () => {
    vi.mocked(appointmentsService.getUpcoming).mockResolvedValue([mockAppointment])

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useUpcomingAppointments(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([mockAppointment])
    expect(appointmentsService.getUpcoming).toHaveBeenCalled()
  })
})

describe('useCreateAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create an appointment and invalidate appointments and authorizations', async () => {
    vi.mocked(appointmentsService.create).mockResolvedValue(mockAppointment)

    const { wrapper, invalidateQueriesSpy } = createWrapper()
    const { result } = renderHook(() => useCreateAppointment(), { wrapper })

    await result.current.mutateAsync({
      familyMemberId: 'member-1',
      authorizationId: 'auth-1',
      authorizationServiceId: 'service-1',
      appointmentDate: '2026-04-10T14:00:00.000Z',
    })

    expect(appointmentsService.create).toHaveBeenCalledWith({
      familyMemberId: 'member-1',
      authorizationId: 'auth-1',
      authorizationServiceId: 'service-1',
      appointmentDate: '2026-04-10T14:00:00.000Z',
    })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['appointments'] })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['authorizations'] })
  })
})

describe('useUpdateAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update an appointment and invalidate appointments', async () => {
    vi.mocked(appointmentsService.update).mockResolvedValue({
      ...mockAppointment,
      status: 'confirmed',
    })

    const { wrapper, invalidateQueriesSpy } = createWrapper()
    const { result } = renderHook(() => useUpdateAppointment(), { wrapper })

    await result.current.mutateAsync({
      id: 'appt-1',
      data: { status: 'confirmed' },
    })

    expect(appointmentsService.update).toHaveBeenCalledWith('appt-1', {
      status: 'confirmed',
    })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['appointments'] })
  })
})

describe('useDeleteAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete an appointment and invalidate appointments and authorizations', async () => {
    vi.mocked(appointmentsService.delete).mockResolvedValue()

    const { wrapper, invalidateQueriesSpy } = createWrapper()
    const { result } = renderHook(() => useDeleteAppointment(), { wrapper })

    await result.current.mutateAsync('appt-1')

    expect(appointmentsService.delete).toHaveBeenCalledWith('appt-1')
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['appointments'] })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['authorizations'] })
  })

  it('should propagate deletion errors', async () => {
    vi.mocked(appointmentsService.delete).mockRejectedValue(new Error('Not found'))

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useDeleteAppointment(), { wrapper })

    await expect(result.current.mutateAsync('invalid-id')).rejects.toThrow('Not found')
  })
})
