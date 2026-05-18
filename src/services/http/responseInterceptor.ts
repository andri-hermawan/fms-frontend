import { type AxiosError } from 'axios'
import axiosInstance from './axiosInstance'
import { useAuthStore } from '@/stores/auth.store'

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token!)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => {
    // console.log(`[RESPONSE] ✅ ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`)
    return response
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean
    }

    const url    = originalRequest?.url ?? ''
    const method = originalRequest?.method?.toUpperCase() ?? ''
    const status = error.response?.status

    // console.error(`[RESPONSE] ❌ ${method} ${url} → ${status}`)

    // Bukan 401 → lempar langsung
    if (status !== 401) {
      return Promise.reject(error)
    }

    // Request ke /auth/refresh sendiri yang 401 → logout
    if (url.includes('/fms/api/auth/refresh')) {
      // console.error('[RESPONSE] 🔴 /auth/refresh → 401, logout')
      useAuthStore.getState().logout()
      // window.location.href = '/login'
      return Promise.reject(error)
    }

    // Sudah retry tapi masih 401 → logout
    if (originalRequest?._retry) {
      // console.error('[RESPONSE] 🔴 Sudah retry tapi masih 401, logout')
      useAuthStore.getState().logout()
      // window.location.href = '/login'
      return Promise.reject(error)
    }

    // Session belum restored (useRestoreSession masih berjalan)
    // Tunggu dulu, jangan dobel refresh
    const isSessionRestored = useAuthStore.getState()._isSessionRestored
    if (!isSessionRestored) {
      // console.log('[RESPONSE] Session belum restored, antrekan request:', url)
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers!.Authorization = `Bearer ${token}`
          return axiosInstance(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    // Sedang refresh → antrekan
    if (isRefreshing) {
      // console.log('[RESPONSE] Sedang refresh, antrekan:', url)
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers!.Authorization = `Bearer ${token}`
          return axiosInstance(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = useAuthStore.getState().refreshToken
    // console.log('[RESPONSE] 🔄 Mulai refresh token...', { hasRefreshToken: !!refreshToken })

    try {
      if (!refreshToken) throw new Error('No refresh token')

      const { data: response } = await axiosInstance.post('/auth/refresh', {
        refresh_token: refreshToken,
      })

      const newAccessToken: string  = response.data?.accessToken
      const newRefreshToken: string = response.data?.refreshToken ?? refreshToken

      // console.log('[RESPONSE] ✅ Refresh berhasil', { hasNewToken: !!newAccessToken })

      if (!newAccessToken) throw new Error('accessToken kosong di response')

      useAuthStore.getState().setTokens(newAccessToken, newRefreshToken)
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
      originalRequest.headers!.Authorization = `Bearer ${newAccessToken}`

      processQueue(null, newAccessToken)
      return axiosInstance(originalRequest)

    } catch (refreshError: any) {
      // console.error('[RESPONSE] 🔴 Refresh GAGAL → logout', refreshError?.message)
      processQueue(refreshError, null)
      useAuthStore.getState().logout()
      // window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)