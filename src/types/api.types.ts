// Format standard response dari backend NestJS
export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

// Format paginated: data langsung array, meta sejajar
export interface PaginatedResponse<T> {
  statusCode: number
  message: string
  data: T[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export type ApiError = {
  message: string
  statusCode: number
  error?: string
}