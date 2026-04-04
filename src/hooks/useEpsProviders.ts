import { useQuery } from '@tanstack/react-query'
import { epsProvidersService } from '@/services/eps-providers.service'

export function useEpsProviders() {
  return useQuery({
    queryKey: ['eps-providers'],
    queryFn: () => epsProvidersService.getAll(),
    staleTime: Infinity,
  })
}
