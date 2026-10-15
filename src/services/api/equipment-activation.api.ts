import { axiosInstance } from '@/services/http'
import type {
  EquipmentActivation,
  EquipmentActivationCreatePayload,
  EquipmentActivationUpdatePayload,
} from '@/types/equipment-activation.types'
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api.types'

const equipmentActivationApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<PaginatedResponse<EquipmentActivation>>(
      '/fms/api/equipment-activation',
      { params },
    ),

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<EquipmentActivation>>(
      `/fms/api/equipment-activation/${id}`,
    ),

  create: (payload: EquipmentActivationCreatePayload) =>
    axiosInstance.post<ApiResponse<EquipmentActivation>>(
      '/fms/api/equipment-activation',
      payload,
    ),

  update: (id: string, payload: EquipmentActivationUpdatePayload) =>
    axiosInstance.patch<ApiResponse<EquipmentActivation>>(
      `/fms/api/equipment-activation/${id}`,
      payload,
    ),

  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(
      `/fms/api/equipment-activation/${id}`,
    ),

  importExcel: (file: File, createdBy: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('created_by', createdBy)
    return axiosInstance.post<ApiResponse<{ imported: number }>>(
      '/fms/api/equipment-activation/import',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },
}

export default equipmentActivationApi
