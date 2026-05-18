import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import authApi from '@/services/api/auth.api'
import { axiosInstance } from '@/services/http'

const useRestoreSession = () => {
  const hasRunRef = useRef(false)
  const hasHydrated        = useAuthStore((s) => s._hasHydrated)
  const setTokens          = useAuthStore((s) => s.setTokens)
  const logout             = useAuthStore((s) => s.logout)
  const setSessionRestored = useAuthStore((s) => s.setSessionRestored)

  useEffect(() => {
    if (!hasHydrated) return

    // Guard StrictMode — hanya run sekali
    if (hasRunRef.current) {
      // console.log('[RESTORE] Skip double invoke (StrictMode)')
      return
    }
    hasRunRef.current = true

    const restore = async () => {
      // Baca langsung dari store untuk nilai terkini (hindari closure stale)
      const { isAuthenticated, refreshToken, accessToken } = useAuthStore.getState()

      // console.log('[RESTORE] State:', { isAuthenticated, hasRefreshToken: !!refreshToken, hasAccessToken: !!accessToken })

      if (!isAuthenticated || !refreshToken) {
        // console.log('[RESTORE] Tidak perlu restore')
        setSessionRestored(true)
        return
      }

      if (accessToken) {
        // console.log('[RESTORE] Token masih ada, skip')
        setSessionRestored(true)
        return
      }

      // console.log('[RESTORE] Hit /auth/refresh...')
      try {
        const { data: response } = await authApi.refresh(refreshToken)

        const newAccessToken  = response.data?.accessToken
        const newRefreshToken = response.data?.refreshToken ?? refreshToken

        if (newAccessToken) {
          setTokens(newAccessToken, newRefreshToken)
          // Update default axios header
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
          // console.log('[RESTORE] ✅ Restore berhasil')
        } else {
          console.error('[RESTORE] 🔴 accessToken kosong → logout')
          logout()
        }
      } catch (err: any) {
        console.error('[RESTORE] 🔴 Gagal:', err?.response?.status)
        logout()
      } finally {
        // console.log('[RESTORE] setSessionRestored(true)')
        setSessionRestored(true)
      }
    }

    restore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated])
}

export default useRestoreSession