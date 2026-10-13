import { axiosInstance } from '@/services/http'

import type {
  Weighbridge,
  WeighbridgeCreatePayload,
  WeighbridgeUpdatePayload,
  WeighbridgeRitaseDaily,
  WeighbridgeRitaseDailyParams,
  WeighbridgePayloadDaily,
  WeighbridgePayloadDailyParams,
  WeighbridgeProductionDaily,
  WeighbridgeProductionDailyParams,
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

  getRitaseDaily: (params: WeighbridgeRitaseDailyParams) =>
    axiosInstance.get<
      ApiResponse<WeighbridgeRitaseDaily>
    >('/fms/api/weighbridge/ritase-daily', {
      params,
      // backend menerima array sebagai query berulang (shift=a&shift=b)
      paramsSerializer: { indexes: null },
    }),

  getPayloadDaily: (params: WeighbridgePayloadDailyParams) =>
    axiosInstance.get<
      ApiResponse<WeighbridgePayloadDaily>
    >('/fms/api/weighbridge/payload-daily', {
      params,
      paramsSerializer: { indexes: null },
    }),

  getProductionDaily: (params: WeighbridgeProductionDailyParams) =>
    axiosInstance.get<
      ApiResponse<WeighbridgeProductionDaily>
    >('/fms/api/weighbridge/production-daily', {
      params,
      paramsSerializer: { indexes: null },
    }),

  getById: (id: string) =>
    axiosInstance.get<
      ApiResponse<Weighbridge>
    >(`/fms/api/weighbridge/${id}`),

  create: (
    payload: WeighbridgeCreatePayload,
  ) =>
    axiosInstance.post<
      ApiResponse<Weighbridge>
    >('/fms/api/weighbridge', payload),

  update: (
    id: string,
    payload: WeighbridgeUpdatePayload,
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

  importExcel: (file: File, createdBy: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('created_by', createdBy)
    return axiosInstance.post<ApiResponse<{ imported: number }>>(
      '/fms/api/weighbridge/import',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },
}

export default weighbridgeApi