import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  useFamilyMembers,
  useFamilyMember,
  useCreateFamilyMember,
  useUpdateFamilyMember,
  useDeleteFamilyMember,
} from '../useFamilyMembers'
import { familyMembersService } from '@/services/family-members.service'

vi.mock('@/services/family-members.service', () => ({
  familyMembersService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockMember = {
  id: 'member-1',
  userId: 'user-1',
  epsProviderId: 'eps-1',
  fullName: 'Juan Pérez',
  documentType: 'CC' as const,
  documentNumber: '123456789',
  birthDate: '1990-01-15',
  address: null,
  phone: null,
  cellphone: '3001234567',
  email: 'juan@test.com',
  department: null,
  city: null,
  regime: 'contributivo',
  relationship: 'Titular',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const mockPaginatedResponse = {
  items: [mockMember],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useFamilyMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch family members list', async () => {
    vi.mocked(familyMembersService.getAll).mockResolvedValue(mockPaginatedResponse)

    const { result } = renderHook(() => useFamilyMembers(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPaginatedResponse)
    expect(familyMembersService.getAll).toHaveBeenCalledWith(undefined)
  })

  it('should pass pagination params', async () => {
    vi.mocked(familyMembersService.getAll).mockResolvedValue(mockPaginatedResponse)

    const { result } = renderHook(
      () => useFamilyMembers({ page: 2, limit: 10 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(familyMembersService.getAll).toHaveBeenCalledWith({ page: 2, limit: 10 })
  })

  it('should handle fetch error', async () => {
    vi.mocked(familyMembersService.getAll).mockRejectedValue(new Error('Network'))

    const { result } = renderHook(() => useFamilyMembers(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Network')
  })
})

describe('useFamilyMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single member by id', async () => {
    vi.mocked(familyMembersService.getById).mockResolvedValue(mockMember)

    const { result } = renderHook(() => useFamilyMember('member-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockMember)
    expect(familyMembersService.getById).toHaveBeenCalledWith('member-1')
  })

  it('should not fetch when id is empty', () => {
    renderHook(() => useFamilyMember(''), {
      wrapper: createWrapper(),
    })

    expect(familyMembersService.getById).not.toHaveBeenCalled()
  })
})

describe('useCreateFamilyMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a family member', async () => {
    vi.mocked(familyMembersService.create).mockResolvedValue(mockMember)

    const { result } = renderHook(() => useCreateFamilyMember(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      fullName: 'Juan Pérez',
      relationship: 'Titular',
    })

    expect(familyMembersService.create).toHaveBeenCalledWith({
      fullName: 'Juan Pérez',
      relationship: 'Titular',
    })
  })

  it('should propagate creation errors', async () => {
    vi.mocked(familyMembersService.create).mockRejectedValue(new Error('Bad request'))

    const { result } = renderHook(() => useCreateFamilyMember(), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync({
        fullName: 'Test',
        relationship: 'Hijo',
      }),
    ).rejects.toThrow('Bad request')
  })
})

describe('useUpdateFamilyMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update a family member', async () => {
    const updated = { ...mockMember, fullName: 'Juan Actualizado' }
    vi.mocked(familyMembersService.update).mockResolvedValue(updated)

    const { result } = renderHook(() => useUpdateFamilyMember(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      id: 'member-1',
      data: { fullName: 'Juan Actualizado' },
    })

    expect(familyMembersService.update).toHaveBeenCalledWith('member-1', {
      fullName: 'Juan Actualizado',
    })
  })
})

describe('useDeleteFamilyMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete a family member', async () => {
    vi.mocked(familyMembersService.delete).mockResolvedValue()

    const { result } = renderHook(() => useDeleteFamilyMember(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('member-1')

    expect(familyMembersService.delete).toHaveBeenCalledWith('member-1')
  })

  it('should propagate deletion errors', async () => {
    vi.mocked(familyMembersService.delete).mockRejectedValue(new Error('Not found'))

    const { result } = renderHook(() => useDeleteFamilyMember(), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync('invalid-id'),
    ).rejects.toThrow('Not found')
  })
})
