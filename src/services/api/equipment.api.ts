import { axiosInstance } from '@/services/http'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'
import { Equipment, EquipmentFormValues } from '@/types/equipment.types'

const equipmentApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<PaginatedResponse<Equipment>>('/fms/api/equipments', { params }),

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Equipment>>(`/fms/api/equipments/${id}`),

  create: (payload: EquipmentFormValues) =>
    axiosInstance.post<ApiResponse<Equipment>>('/fms/api/equipments', payload),

  update: (id: string, payload: Partial<EquipmentFormValues>) =>
    axiosInstance.put<ApiResponse<Equipment>>(`/fms/api/equipments/${id}`, payload),

  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/fms/api/equipments/${id}`),

  uploadPhoto: (id: string, file: File) => {
    const form = new FormData()
    form.append('photo', file)
    return axiosInstance.post<ApiResponse<{ photoUrl: string }>>(
      `/fms/api/equipments/${id}/photo`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },
}

export default equipmentApi
