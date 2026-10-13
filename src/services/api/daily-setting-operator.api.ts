import { axiosInstance } from '@/services/http'

import type {
  DailySettingOperator,
  DailySettingOperatorCreatePayload,
  DailySettingOperatorUpdatePayload,
} from '@/types/daily-setting-operator.types'

import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api.types'

const dailySettingOperatorApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<
      PaginatedResponse<DailySettingOperator>
    >('/fms/api/setting-operator', {
      params,
    }),

  getById: (id: string) =>
    axiosInstance.get<
      ApiResponse<DailySettingOperator>
    >(`/fms/api/setting-operator/${id}`),

  create: (
    payload: DailySettingOperatorCreatePayload,
  ) =>
    axiosInstance.post<
      ApiResponse<DailySettingOperator>
    >('/fms/api/setting-operator', payload),

  update: (
    id: string,
    payload: DailySettingOperatorUpdatePayload,
  ) =>
    axiosInstance.patch<
      ApiResponse<DailySettingOperator>
    >(
      `/fms/api/setting-operator/${id}`,
      payload,
    ),

  delete: (id: string) =>
    axiosInstance.delete<
      ApiResponse<null>
    >(`/fms/api/setting-operator/${id}`),

  importExcel: (file: File, createdBy: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('created_by', createdBy)
    return axiosInstance.post<ApiResponse<{ imported: number }>>(
      '/fms/api/setting-operator/import',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },
}

export default dailySettingOperatorApi