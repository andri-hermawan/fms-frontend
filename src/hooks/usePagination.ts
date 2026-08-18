import { useState } from 'react'
import type { PaginationParams } from '@/types/api.types'

interface UsePaginationReturn {
  params: PaginationParams
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setSearch: (search: string) => void
  setDateRange: (created_at?: string, created_at_end?: string) => void
  setAlertCategory: (value: string) => void
  resetParams: () => void
}

const DEFAULT_PARAMS: PaginationParams = {
  page: 1,
  limit: 25,
}

const usePagination = (
  initial?: Partial<PaginationParams>,
): UsePaginationReturn => {
  const [params, setParams] = useState<PaginationParams>({
    ...DEFAULT_PARAMS,
    ...initial,
  })

  return {
    params,

    setPage: (page) =>
      setParams((prev) => ({
        ...prev,
        page,
      })),

    setLimit: (limit) =>
      setParams((prev) => ({
        ...prev,
        limit,
        page: 1,
      })),

    setSearch: (search) =>
      setParams((prev) => ({
        ...prev,
        page: 1,
        ...(search.trim()
          ? { search }
          : { search: undefined }),
      })),

    setDateRange: (created_at, created_at_end) =>
      setParams((prev) => ({
        ...prev,
        page: 1,
        created_at,
        created_at_end,
      })),

    setAlertCategory: (value) =>
      setParams((prev) => ({
        ...prev,
        page: 1,
        alert_category: value,
      })),

    resetParams: () =>
      setParams({
        ...DEFAULT_PARAMS,
        ...initial,
      }),
  }
}

export default usePagination