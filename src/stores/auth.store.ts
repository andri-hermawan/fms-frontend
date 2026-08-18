import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  User,
  Role,
  LoginProject,
} from '@/types/auth.types'

interface AuthState {
  user: User | null
  project: LoginProject | null

  accessToken: string | null
  refreshToken: string | null

  isAuthenticated: boolean

  _hasHydrated: boolean
  _isSessionRestored: boolean

  setTokens: (
    accessToken: string,
    refreshToken: string,
  ) => void

  setAccessToken: (
    token: string,
  ) => void

  setUser: (
    user: User,
  ) => void

  setProject: (
    project: LoginProject | null,
  ) => void

  updateProject: (
    project: Partial<LoginProject>,
  ) => void

  logout: () => void

  setHasHydrated: (
    val: boolean,
  ) => void

  setSessionRestored: (
    val: boolean,
  ) => void
}

export const useAuthStore =
  create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        project: null,

        accessToken: null,
        refreshToken: null,

        isAuthenticated: false,

        _hasHydrated: false,
        _isSessionRestored: false,

        setTokens: (
          accessToken,
          refreshToken,
        ) => {
          set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
          })
        },

        setAccessToken: (token) => {
          set({
            accessToken: token,
          })
        },

        setUser: (user) => {
          console.log(
            '[AUTH STORE] setUser dipanggil ✅',
            user.email,
          )

          set({ user })
        },

        setProject: (project) => {
          console.log(
            '[AUTH STORE] setProject dipanggil ✅',
            project?.project_name,
          )

          set({ project })
        },

        updateProject: (project) => {
          set((state) => ({
            project: state.project
              ? {
                  ...state.project,
                  ...project,
                }
              : null,
          }))
        },

        logout: () => {
          console.error(
            '[AUTH STORE] 🔴 LOGOUT dipanggil! Stack trace:',
          )

          console.trace()

          set({
            user: null,
            project: null,

            accessToken: null,
            refreshToken: null,

            isAuthenticated: false,

            _isSessionRestored: true,
          })
        },

        setHasHydrated: (val) => {
          set({
            _hasHydrated: val,
          })
        },

        setSessionRestored: (val) => {
          set({
            _isSessionRestored: val,
          })
        },
      }),
      {
        name: 'fms-auth',

        partialize: (state) => ({
          user: state.user,
          project: state.project,
          refreshToken:
            state.refreshToken,
          isAuthenticated:
            state.isAuthenticated,
        }),

        onRehydrateStorage:
          () => (state) => {
            state?.setHasHydrated(true)
          },
      },
    ),
  )

export const selectUser = (
  state: AuthState,
) => state.user

export const selectProject = (
  state: AuthState,
) => state.project

export const selectRole = (
  state: AuthState,
): Role | null =>
  state.user?.role ?? null

export const selectIsAuthenticated = (
  state: AuthState,
) => state.isAuthenticated

export const selectHasHydrated = (
  state: AuthState,
) => state._hasHydrated

export const selectIsSessionRestored = (
  state: AuthState,
) => state._isSessionRestored