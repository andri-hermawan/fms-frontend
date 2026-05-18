import { useState } from 'react'
import type { PaginationParams } from '@/types/api.types'

interface UsePaginationReturn {
  params: PaginationParams
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setSearch: (search: string) => void
  resetParams: () => void
}

const DEFAULT_PARAMS: PaginationParams = {
  page: 1,
  limit: 25,
}

const usePagination = (initial?: Partial<PaginationParams>): UsePaginationReturn => {
  const [params, setParams] = useState<PaginationParams>({
    ...DEFAULT_PARAMS,
    ...initial,
  })

  return {
    params,

    setPage: (page) =>
      setParams((prev) => ({ ...prev, page })),

    setLimit: (limit) =>
      setParams((prev) => ({ ...prev, limit, page: 1 })),

    // Hanya kirim search kalau tidak kosong
    setSearch: (search) =>
      setParams((prev) => ({
        ...prev,
        page: 1,
        ...(search.trim() ? { search } : { search: undefined }),
      })),

    resetParams: () =>
      setParams({ ...DEFAULT_PARAMS, ...initial }),
  }
}

export default usePagination