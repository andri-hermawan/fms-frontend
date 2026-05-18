import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import userApi from '@/services/api/user.api'
import type { UserFormValues } from '@/types/user.types'
import type { PaginationParams } from '@/types/api.types'

export const USER_KEY = 'users'

export const useUsers = (params?: PaginationParams) =>
  useQuery({
    queryKey: [USER_KEY, params],
    queryFn: () => userApi.getAll(params).then((r) => r.data),
  })

export const useCreateUser = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: UserFormValues) =>
      userApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USER_KEY] })
      message.success('User berhasil ditambahkan')
    },
    onError: () => message.error('Gagal menambahkan user'),
  })
}

export const useUpdateUser = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UserFormValues> }) =>
      userApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USER_KEY] })
      message.success('User berhasil diperbarui')
    },
    onError: () => message.error('Gagal memperbarui user'),
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      userApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USER_KEY] })
      message.success('User berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus user'),
  })
}
