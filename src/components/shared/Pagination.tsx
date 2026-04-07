import { useId } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

interface PaginationProps {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

function getVisiblePages(page: number, totalPages: number) {
  const maxPages = 5
  const start = Math.max(1, page - Math.floor(maxPages / 2))
  const end = Math.min(totalPages, start + maxPages - 1)
  const adjustedStart = Math.max(1, end - maxPages + 1)

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  )
}

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const pageSizeId = useId()

  if (total === 0) {
    return null
  }

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const visiblePages = getVisiblePages(page, totalPages)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Mostrando {from}-{to} de {total} resultados
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label
            htmlFor={pageSizeId}
            className="text-sm text-muted-foreground"
          >
            Por página
          </label>
          <select
            id={pageSizeId}
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {PAGE_SIZE_OPTIONS.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-label="Primera página"
            disabled={!hasPreviousPage}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-label="Página anterior"
            disabled={!hasPreviousPage}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {visiblePages.map((visiblePage) => (
            <Button
              key={visiblePage}
              type="button"
              size="sm"
              variant={visiblePage === page ? 'default' : 'outline'}
              aria-current={visiblePage === page ? 'page' : undefined}
              onClick={() => onPageChange(visiblePage)}
              className={cn('min-w-9')}
            >
              {visiblePage}
            </Button>
          ))}

          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-label="Página siguiente"
            disabled={!hasNextPage}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-label="Última página"
            disabled={!hasNextPage}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
