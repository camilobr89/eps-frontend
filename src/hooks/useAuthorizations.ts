import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authorizationsService } from '@/services/authorizations.service'
import type {
  AuthorizationFilters,
  CreateAuthorizationRequest,
  PaginationParams,
  UpdateAuthorizationRequest,
} from '@/types'

const AUTHORIZATIONS_KEY = 'authorizations'

export function useAuthorizations(filters?: AuthorizationFilters & PaginationParams) {
  return useQuery({
    queryKey: [AUTHORIZATIONS_KEY, filters],
    queryFn: () => authorizationsService.getAll(filters),
  })
}

export function useAuthorization(id: string) {
  return useQuery({
    queryKey: [AUTHORIZATIONS_KEY, id],
    queryFn: () => authorizationsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateAuthorization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAuthorizationRequest) => authorizationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTHORIZATIONS_KEY] })
    },
  })
}

export function useUpdateAuthorization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAuthorizationRequest }) =>
      authorizationsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTHORIZATIONS_KEY] })
    },
  })
}

export function useDeleteAuthorization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => authorizationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTHORIZATIONS_KEY] })
    },
  })
}
