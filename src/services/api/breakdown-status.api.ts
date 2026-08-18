import { axiosInstance } from '@/services/http'

import type {
  BreakdownStatus,
  BreakdownStatusFormValues,
} from '@/types/breakdown-status.types'

import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api.types'

const breakdownStatusApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<
      PaginatedResponse<BreakdownStatus>
    >('/fms/api/breakdown-status', {
      params,
    }),

  getById: (id: string) =>
    axiosInstance.get<
      ApiResponse<BreakdownStatus>
    >(`/fms/api/breakdown-status/${id}`),

  create: (
    payload: BreakdownStatusFormValues,
  ) =>
    axiosInstance.post<
      ApiResponse<BreakdownStatus>
    >('/fms/api/breakdown-status', payload),

  update: (
    id: string,
    payload: Partial<BreakdownStatusFormValues>,
  ) =>
    axiosInstance.put<
      ApiResponse<BreakdownStatus>
    >(
      `/fms/api/breakdown-status/${id}`,
      payload,
    ),

  delete: (id: string) =>
    axiosInstance.delete<
      ApiResponse<null>
    >(`/fms/api/breakdown-status/${id}`),

  importExcel: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return axiosInstance.post<ApiResponse<{ imported: number }>>(
      '/fms/api/breakdown-status/import',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },
}

export default breakdownStatusApi