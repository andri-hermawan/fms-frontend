import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Role } from '@/types/auth.types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  _isSessionRestored: boolean

  setTokens: (accessToken: string, refreshToken: string) => void
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
  setHasHydrated: (val: boolean) => void
  setSessionRestored: (val: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,
      _isSessionRestored: false,

      setTokens: (accessToken, refreshToken) => {
        // console.log('[AUTH STORE] setTokens dipanggil ✅')
        set({ accessToken, refreshToken, isAuthenticated: true })
      },

      setAccessToken: (token) => {
        // console.log('[AUTH STORE] setAccessToken dipanggil ✅')
        set({ accessToken: token })
      },

      setUser: (user) => {
        // console.log('[AUTH STORE] setUser dipanggil ✅', user.email)
        set({ user })
      },

      logout: () => {
        // Stack trace untuk tahu SIAPA yang panggil logout
        console.error('[AUTH STORE] 🔴 LOGOUT dipanggil! Stack trace:')
        console.trace()
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          _isSessionRestored: true,
        })
      },

      setHasHydrated: (val) => {
        // console.log('[AUTH STORE] setHasHydrated:', val)
        set({ _hasHydrated: val })
      },

      setSessionRestored: (val) => {
        // console.log('[AUTH STORE] setSessionRestored:', val)
        set({ _isSessionRestored: val })
      },
    }),
    {
      name: 'fms-auth',
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // console.log('[AUTH STORE] onRehydrateStorage selesai', {
        //   isAuthenticated: state?.isAuthenticated,
        //   hasRefreshToken: !!state?.refreshToken,
        // })
        state?.setHasHydrated(true)
      },
    }
  )
)

export const selectUser              = (state: AuthState) => state.user
export const selectRole              = (state: AuthState): Role | null => state.user?.role ?? null
export const selectIsAuthenticated   = (state: AuthState) => state.isAuthenticated
export const selectHasHydrated       = (state: AuthState) => state._hasHydrated
export const selectIsSessionRestored = (state: AuthState) => state._isSessionRestored