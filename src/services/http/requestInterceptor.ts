import type { InternalAxiosRequestConfig } from 'axios'
import axiosInstance from './axiosInstance'
import { useAuthStore } from '@/stores/auth.store'

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken

    // console.log(`[REQUEST] ${config.method?.toUpperCase()} ${config.url}`, {
    //   hasToken: !!token,
    //   tokenPreview: token ? `${token.substring(0, 30)}...` : 'NULL',
    // })

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      // console.warn(`[REQUEST] ⚠️ NO TOKEN untuk ${config.url}`)
    }

    return config
  },
  (error) => Promise.reject(error)
)