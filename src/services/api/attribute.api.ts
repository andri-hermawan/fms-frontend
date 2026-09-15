import { axiosInstance } from '@/services/http'
import type { Attribute, AttributeFormValues } from '@/types/attribute.types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'

const attributeApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<PaginatedResponse<Attribute>>('/fms/api/attribute-geo', { params }),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Attribute>>(`/fms/api/attributes/${id}`),
  create: (payload: AttributeFormValues) =>
    axiosInstance.post<ApiResponse<Attribute>>('/fms/api/attributes', payload),
  update: (id: string, payload: Partial<AttributeFormValues>) =>
    axiosInstance.put<ApiResponse<Attribute>>(`/fms/api/attributes/${id}`, payload),
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/fms/api/attributes/${id}`),
}

export default attributeApi