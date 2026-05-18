import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import alertCategoryApi from '@/services/api/alert-category.api'
import type { AlertCategoryFormValues } from '@/types/alert-category.types'
import type { PaginationParams } from '@/types/api.types'

export const ALERT_CATEGORY_KEY = 'alert-categories'

export const useAlertCategories = (params?: PaginationParams) =>
  useQuery({
    queryKey: [ALERT_CATEGORY_KEY, params],
    queryFn: () => alertCategoryApi.getAll(params).then((r) => r.data),
  })

export const useCreateAlertCategory = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: AlertCategoryFormValues) =>
      alertCategoryApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ALERT_CATEGORY_KEY] })
      message.success('Kategori alert berhasil ditambahkan')
    },
    onError: () => message.error('Gagal menambahkan kategori alert'),
  })
}

export const useUpdateAlertCategory = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AlertCategoryFormValues> }) =>
      alertCategoryApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ALERT_CATEGORY_KEY] })
      message.success('Kategori alert berhasil diperbarui')
    },
    onError: () => message.error('Gagal memperbarui kategori alert'),
  })
}

export const useDeleteAlertCategory = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      alertCategoryApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ALERT_CATEGORY_KEY] })
      message.success('Kategori alert berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus kategori alert'),
  })
}
