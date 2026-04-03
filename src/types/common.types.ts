export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface ApiError {
  statusCode: number
  message: string
  errors?: { field: string; message: string }[]
  timestamp: string
  path: string
}
