import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

interface UsePaginationOptions {
  defaultPage?: number
  defaultLimit?: number
  totalPages?: number
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function usePagination({
  defaultPage = 1,
  defaultLimit = 20,
  totalPages = 1,
}: UsePaginationOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parsePositiveInt(searchParams.get('page'), defaultPage)
  const limit = parsePositiveInt(searchParams.get('limit'), defaultLimit)
  const normalizedTotalPages = Math.max(1, totalPages)

  const setPage = useCallback((nextPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      const safePage = Math.min(Math.max(1, nextPage), normalizedTotalPages)

      if (safePage === defaultPage) {
        next.delete('page')
      } else {
        next.set('page', String(safePage))
      }

      return next
    })
  }, [defaultPage, normalizedTotalPages, setSearchParams])

  const setLimit = useCallback((nextLimit: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      const safeLimit = Math.max(1, nextLimit)

      if (safeLimit === defaultLimit) {
        next.delete('limit')
      } else {
        next.set('limit', String(safeLimit))
      }

      next.delete('page')
      return next
    })
  }, [defaultLimit, setSearchParams])

  useEffect(() => {
    if (page > normalizedTotalPages) {
      setPage(normalizedTotalPages)
    }
  }, [normalizedTotalPages, page, setPage])

  return useMemo(
    () => ({
      page,
      limit,
      setPage,
      setLimit,
      totalPages: normalizedTotalPages,
      hasNextPage: page < normalizedTotalPages,
      hasPreviousPage: page > 1,
    }),
    [limit, normalizedTotalPages, page, setLimit, setPage],
  )
}
