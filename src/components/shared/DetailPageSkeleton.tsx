import { Skeleton } from '@/components/shared/Skeleton'

interface DetailPageSkeletonProps {
  cards?: number
}

export function DetailPageSkeleton({
  cards = 2,
}: DetailPageSkeletonProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: cards }).map((_, index) => (
          <div
            key={index}
            className="space-y-4 rounded-xl border border-border/70 p-5"
          >
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((__, rowIndex) => (
                <div key={rowIndex} className="space-y-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
