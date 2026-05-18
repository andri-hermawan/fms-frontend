import { axiosInstance } from '@/services/http'
import type { Device, DeviceFormValues } from '@/types/device.types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'

const deviceApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<PaginatedResponse<Device>>('/fms/api/devices', { params }),

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Device>>(`/fms/api/devices/${id}`),

  create: (payload: DeviceFormValues) =>
    axiosInstance.post<ApiResponse<Device>>('/fms/api/devices', payload),

  update: (id: string, payload: Partial<DeviceFormValues>) =>
    axiosInstance.put<ApiResponse<Device>>(`/fms/api/devices/${id}`, payload),

  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/fms/api/devices/${id}`),
}

export default deviceApi
