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
  update: async (id: string, payload: Partial<UserFormValues> & { password?: string }) => {
    // Jangan log nilai password; hanya log metadata request untuk diagnosis.
    console.debug('[USER UPDATE] PATCH request', {
      id,
      fields: Object.keys(payload),
      hasPassword: Boolean(payload.password),
    })

    try {
      const response = await axiosInstance.patch<ApiResponse<User>>(
        `/fms/api/users/${id}`,
        payload,
      )
      console.debug('[USER UPDATE] success', {
        id,
        status: response.status,
        message: response.data.message,
      })
      return response
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: unknown }
        message?: string
      }
      console.error('[USER UPDATE] failed', {
        id,
        status: axiosError.response?.status,
        response: axiosError.response?.data,
        message: axiosError.message,
      })
      throw error
    }
  },
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/fms/api/users/${id}`),
}
export default userApi
