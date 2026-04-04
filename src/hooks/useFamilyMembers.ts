import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { familyMembersService } from '@/services/family-members.service'
import type {
  CreateFamilyMemberRequest,
  PaginationParams,
  UpdateFamilyMemberRequest,
} from '@/types'

const FAMILY_MEMBERS_KEY = 'family-members'

export function useFamilyMembers(params?: PaginationParams) {
  return useQuery({
    queryKey: [FAMILY_MEMBERS_KEY, params],
    queryFn: () => familyMembersService.getAll(params),
  })
}

export function useFamilyMember(id: string) {
  return useQuery({
    queryKey: [FAMILY_MEMBERS_KEY, id],
    queryFn: () => familyMembersService.getById(id),
    enabled: !!id,
  })
}

export function useCreateFamilyMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFamilyMemberRequest) =>
      familyMembersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAMILY_MEMBERS_KEY] })
    },
  })
}

export function useUpdateFamilyMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFamilyMemberRequest }) =>
      familyMembersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAMILY_MEMBERS_KEY] })
    },
  })
}

export function useDeleteFamilyMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => familyMembersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAMILY_MEMBERS_KEY] })
    },
  })
}
