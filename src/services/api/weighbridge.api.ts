import { axiosInstance } from '@/services/http'

import type {
  Weighbridge,
  WeighbridgeFormValues,
} from '@/types/weighbridge.types'

import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api.types'

const weighbridgeApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<
      PaginatedResponse<Weighbridge>
    >('/fms/api/weighbridge', {
      params,
    }),

  getById: (id: string) =>
    axiosInstance.get<
      ApiResponse<Weighbridge>
    >(`/fms/api/weighbridge/${id}`),

  create: (
    payload: WeighbridgeFormValues,
  ) =>
    axiosInstance.post<
      ApiResponse<Weighbridge>
    >('/fms/api/weighbridge', payload),

  update: (
    id: string,
    payload: Partial<WeighbridgeFormValues>,
  ) =>
    axiosInstance.put<
      ApiResponse<Weighbridge>
    >(
      `/fms/api/weighbridge/${id}`,
      payload,
    ),

  delete: (id: string) =>
    axiosInstance.delete<
      ApiResponse<null>
    >(`/fms/api/weighbridge/${id}`),

  importExcel: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return axiosInstance.post<ApiResponse<{ imported: number }>>(
      '/fms/api/weighbridge/import',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },
}

export default weighbridgeApi