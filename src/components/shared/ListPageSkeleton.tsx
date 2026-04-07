import { Skeleton } from '@/components/shared/Skeleton'

interface ListPageSkeletonProps {
  showFilters?: boolean
  items?: number
}

export function ListPageSkeleton({
  showFilters = true,
  items = 6,
}: ListPageSkeletonProps) {
  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-52" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: items }).map((_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-xl border border-border/70 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
