import { axiosInstance } from '@/services/http'
import type { User, UserFormValues } from '@/types/user.types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'

const userApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<PaginatedResponse<User>>('/fms/api/users', { params }),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<User>>(`/fms/api/users/${id}`),
  create: (payload: UserFormValues) =>
    axiosInstance.post<ApiResponse<User>>('/fms/api/users', payload),
  update: (id: string, payload: Partial<UserFormValues>) =>
    axiosInstance.put<ApiResponse<User>>(`/fms/api/users/${id}`, payload),
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/fms/api/users/${id}`),
}
export default userApi
