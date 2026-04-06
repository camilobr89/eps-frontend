import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  useAuthorizations,
  useAuthorization,
  useCreateAuthorization,
  useUpdateAuthorization,
  useDeleteAuthorization,
} from '../useAuthorizations'
import { authorizationsService } from '@/services/authorizations.service'

vi.mock('@/services/authorizations.service', () => ({
  authorizationsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockAuthorization = {
  id: 'auth-1',
  familyMemberId: 'member-1',
  epsProviderId: 'eps-1',
  documentType: 'Carta de Autorizacion',
  requestNumber: 'AUTH-001',
  issuingDate: '2026-04-01',
  expirationDate: '2026-04-20',
  diagnosisCode: null,
  diagnosisDescription: null,
  patientLocation: null,
  serviceOrigin: null,
  providerName: null,
  providerNit: null,
  providerCode: null,
  providerAddress: null,
  providerPhone: null,
  providerDepartment: null,
  providerCity: null,
  paymentType: null,
  copayValue: null,
  copayPercentage: null,
  maxValue: null,
  weeksContributed: null,
  priority: 'alta' as const,
  status: 'pending' as const,
  originalFileUrl: null,
  ocrRawText: null,
  ocrConfidence: null,
  ocrParserUsed: null,
  manuallyReviewed: false,
  notes: null,
  services: [
    {
      authorizationId: 'auth-1',
      id: 'service-1',
      quantity: 1,
      serviceCode: '890201',
      serviceName: 'Consulta especializada',
      serviceType: 'consulta',
    },
  ],
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-01T00:00:00Z',
}

const mockPaginatedResponse = {
  data: [mockAuthorization],
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

describe('useAuthorizations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch authorizations list', async () => {
    vi.mocked(authorizationsService.getAll).mockResolvedValue(mockPaginatedResponse)

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAuthorizations(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPaginatedResponse)
    expect(authorizationsService.getAll).toHaveBeenCalledWith(undefined)
  })

  it('should pass filters to the service', async () => {
    vi.mocked(authorizationsService.getAll).mockResolvedValue(mockPaginatedResponse)

    const filters = {
      status: 'pending' as const,
      priority: 'alta' as const,
      familyMemberId: 'member-1',
      expiringBefore: '2026-04-10',
      page: 2,
      limit: 10,
    }

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAuthorizations(filters), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(authorizationsService.getAll).toHaveBeenCalledWith(filters)
  })

  it('should handle fetch error', async () => {
    vi.mocked(authorizationsService.getAll).mockRejectedValue(new Error('Network'))

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAuthorizations(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Network')
  })
})

describe('useAuthorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single authorization by id', async () => {
    vi.mocked(authorizationsService.getById).mockResolvedValue(mockAuthorization)

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAuthorization('auth-1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockAuthorization)
    expect(authorizationsService.getById).toHaveBeenCalledWith('auth-1')
  })

  it('should not fetch when id is empty', () => {
    const { wrapper } = createWrapper()

    renderHook(() => useAuthorization(''), { wrapper })

    expect(authorizationsService.getById).not.toHaveBeenCalled()
  })
})

describe('useCreateAuthorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create an authorization and invalidate the list', async () => {
    vi.mocked(authorizationsService.create).mockResolvedValue(mockAuthorization)

    const { wrapper, invalidateQueriesSpy } = createWrapper()
    const { result } = renderHook(() => useCreateAuthorization(), { wrapper })

    await result.current.mutateAsync({
      familyMemberId: 'member-1',
      documentType: 'Carta de Autorizacion',
      services: [
        {
          serviceCode: '890201',
          serviceName: 'Consulta especializada',
          quantity: 1,
        },
      ],
    })

    expect(authorizationsService.create).toHaveBeenCalledWith({
      familyMemberId: 'member-1',
      documentType: 'Carta de Autorizacion',
      services: [
        {
          serviceCode: '890201',
          serviceName: 'Consulta especializada',
          quantity: 1,
        },
      ],
    })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['authorizations'] })
  })
})

describe('useUpdateAuthorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update an authorization and invalidate the list', async () => {
    vi.mocked(authorizationsService.update).mockResolvedValue({
      ...mockAuthorization,
      notes: 'Actualizada',
    })

    const { wrapper, invalidateQueriesSpy } = createWrapper()
    const { result } = renderHook(() => useUpdateAuthorization(), { wrapper })

    await result.current.mutateAsync({
      id: 'auth-1',
      data: { notes: 'Actualizada' },
    })

    expect(authorizationsService.update).toHaveBeenCalledWith('auth-1', {
      notes: 'Actualizada',
    })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['authorizations'] })
  })
})

describe('useDeleteAuthorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete an authorization and invalidate the list', async () => {
    vi.mocked(authorizationsService.delete).mockResolvedValue()

    const { wrapper, invalidateQueriesSpy } = createWrapper()
    const { result } = renderHook(() => useDeleteAuthorization(), { wrapper })

    await result.current.mutateAsync('auth-1')

    expect(authorizationsService.delete).toHaveBeenCalledWith('auth-1')
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['authorizations'] })
  })

  it('should propagate deletion errors', async () => {
    vi.mocked(authorizationsService.delete).mockRejectedValue(new Error('Not found'))

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useDeleteAuthorization(), { wrapper })

    await expect(result.current.mutateAsync('invalid-id')).rejects.toThrow('Not found')
  })
})
