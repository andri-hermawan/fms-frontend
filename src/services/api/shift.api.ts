import { axiosInstance } from '@/services/http'
import type { Shift, ShiftFormValues } from '@/types/shift.types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'

const shiftApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<PaginatedResponse<Shift>>('/fms/api/shifts', { params }),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Shift>>(`/fms/api/shifts/${id}`),
  create: (payload: ShiftFormValues) =>
    axiosInstance.post<ApiResponse<Shift>>('/fms/api/shifts', payload),
  update: (id: string, payload: Partial<ShiftFormValues>) =>
    axiosInstance.put<ApiResponse<Shift>>(`/fms/api/shifts/${id}`, payload),
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/fms/api/shifts/${id}`),
}
export default shiftApi
