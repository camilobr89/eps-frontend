import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface QueryWrapperProps<TData> {
  query: Pick<
    UseQueryResult<TData, Error>,
    'data' | 'error' | 'isError' | 'isLoading' | 'refetch'
  >
  isEmpty?: (data: TData) => boolean
  emptyState?: ReactNode
  loadingFallback?: ReactNode
  errorTitle?: string
  errorDescription?: string
  children: (data: TData) => ReactNode
}

export function QueryWrapper<TData>({
  query,
  isEmpty,
  emptyState,
  loadingFallback,
  errorTitle = 'No fue posible cargar esta información',
  errorDescription = 'Intenta nuevamente para consultar los datos.',
  children,
}: QueryWrapperProps<TData>) {
  if (query.isLoading) {
    return loadingFallback ?? <LoadingSpinner size="lg" />
  }

  if (query.isError) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-12 w-12" />}
        title={errorTitle}
        description={query.error?.message ?? errorDescription}
        action={
          <Button type="button" variant="outline" onClick={() => void query.refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        }
      />
    )
  }

  if (!query.data) {
    return null
  }

  if (isEmpty?.(query.data)) {
    return <>{emptyState}</>
  }

  return <>{children(query.data)}</>
}
