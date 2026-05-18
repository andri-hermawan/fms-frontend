import { axiosInstance } from '@/services/http'
import type { Company, CompanyFormValues } from '@/types/company.types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'

const companyApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<PaginatedResponse<Company>>('/fms/api/companies', { params }),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Company>>(`/fms/api/companies/${id}`),
  create: (payload: CompanyFormValues) =>
    axiosInstance.post<ApiResponse<Company>>('/fms/api/companies', payload),
  update: (id: string, payload: Partial<CompanyFormValues>) =>
    axiosInstance.put<ApiResponse<Company>>(`/fms/api/companies/${id}`, payload),
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/fms/api/companies/${id}`),
}
export default companyApi
