export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
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
