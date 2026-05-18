import { useAuthStore } from '@/stores/auth.store'

/**
 * Shortcut hook untuk data auth yang paling sering dipakai.
 */
const useAuth = () => {
  const user            = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout          = useAuthStore((s) => s.logout)
  const setUser         = useAuthStore((s) => s.setUser)
  const setAccessToken  = useAuthStore((s) => s.setAccessToken)

  return {
    user,
    role: user?.role ?? null,
    isAuthenticated,
    logout,
    setUser,
    setAccessToken,
  }
}

export default useAuth
