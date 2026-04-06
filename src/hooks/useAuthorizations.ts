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
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: [AUTHORIZATIONS_KEY, id],
    queryFn: async () => {
      const fetched = await authorizationsService.getById(id)
      const current = queryClient.getQueryData<typeof fetched>([AUTHORIZATIONS_KEY, id])

      // The backend detail payload may omit associated documents even when they already exist.
      // Preserve the last known document metadata so the uploaded file remains visible while OCR updates arrive.
      return {
        ...current,
        ...fetched,
        documents: fetched.documents ?? current?.documents ?? [],
      }
    },
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
