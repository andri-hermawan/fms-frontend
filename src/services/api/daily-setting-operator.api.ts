import { axiosInstance } from '@/services/http'

import type {
  DailySettingOperator,
  DailySettingOperatorFormValues,
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
    payload: DailySettingOperatorFormValues,
  ) =>
    axiosInstance.post<
      ApiResponse<DailySettingOperator>
    >('/fms/api/setting-operator', payload),

  update: (
    id: string,
    payload: Partial<DailySettingOperatorFormValues>,
  ) =>
    axiosInstance.put<
      ApiResponse<DailySettingOperator>
    >(
      `/fms/api/setting-operator/${id}`,
      payload,
    ),

  delete: (id: string) =>
    axiosInstance.delete<
      ApiResponse<null>
    >(`/fms/api/setting-operator/${id}`),

  importExcel: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return axiosInstance.post<ApiResponse<{ imported: number }>>(
      '/fms/api/setting-operator/import',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },
}

export default dailySettingOperatorApi