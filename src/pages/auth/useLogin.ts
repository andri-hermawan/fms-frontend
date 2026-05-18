import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { App } from 'antd'
import authApi from '@/services/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTES } from '@/router/routes'
import type { LoginRequest } from '@/types/auth.types'

const useLogin = () => {
  const navigate    = useNavigate()
  const setTokens   = useAuthStore((s) => s.setTokens)
  const setUser     = useAuthStore((s) => s.setUser)
  const { message } = App.useApp()

  const mutation = useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),

    onSuccess: ({ data: response }) => {
      const { access_token, refresh_token, user } = response.data

      // Simpan kedua token + user ke store
      setTokens(access_token, refresh_token)
      setUser(user)

      message.success(`Welcome Back, ${user.name}!`)
      navigate(ROUTES.DASHBOARD)
    },

    onError: (error) => {
      const msg = error?.message ?? 'Email atau password salah.'
      message.error(msg)
    },
  })

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
  }
}

export default useLogin