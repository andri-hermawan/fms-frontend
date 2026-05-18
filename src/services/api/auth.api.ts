import { axiosInstance } from '@/services/http'
import type { LoginRequest, LoginResponseData, RefreshResponseData } from '@/types/auth.types'

interface BackendResponse<T> {
  statusCode: number
  message: string
  data: T
}

const authApi = {
  login: (payload: LoginRequest) =>
    axiosInstance.post<BackendResponse<LoginResponseData>>('/fms/api/auth/login', payload),

  // Kirim refresh_token (snake_case) di body
  // Response balik accessToken + refreshToken (camelCase)
  refresh: (refreshToken: string) =>
    axiosInstance.post<BackendResponse<RefreshResponseData>>(
      '/fms/api/auth/refresh',
      { refresh_token: refreshToken }
    ),

  logout: () =>
    axiosInstance.post('/fms/api/auth/logout'),

  getProfile: () =>
    axiosInstance.get('/fms/api/auth/me'),
}

export default authApi