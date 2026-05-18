import { axiosInstance } from '@/services/http'
import type { AlertCategory, AlertCategoryFormValues } from '@/types/alert-category.types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'

const alertCategoryApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<PaginatedResponse<AlertCategory>>('/fms/api/alert-categories', { params }),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<AlertCategory>>(`/fms/api/alert-categories/${id}`),
  create: (payload: AlertCategoryFormValues) =>
    axiosInstance.post<ApiResponse<AlertCategory>>('/fms/api/alert-categories', payload),
  update: (id: string, payload: Partial<AlertCategoryFormValues>) =>
    axiosInstance.put<ApiResponse<AlertCategory>>(`/fms/api/alert-categories/${id}`, payload),
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/fms/api/alert-categories/${id}`),
}
export default alertCategoryApi
