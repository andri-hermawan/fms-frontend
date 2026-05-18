import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import deviceApi from '@/services/api/device.api'
import type { DeviceFormValues } from '@/types/device.types'
import type { PaginationParams } from '@/types/api.types'

export const DEVICE_KEY = 'devices'

export const useDevices = (params?: PaginationParams) =>
  useQuery({
    queryKey: [DEVICE_KEY, params],
    queryFn: () => deviceApi.getAll(params).then((r) => r.data),
  })

export const useCreateDevice = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()

  return useMutation({
    mutationFn: (payload: DeviceFormValues) =>
      deviceApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DEVICE_KEY] })
      message.success('Device berhasil ditambahkan')
    },
    onError: () => message.error('Gagal menambahkan device'),
  })
}

export const useUpdateDevice = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<DeviceFormValues> }) =>
      deviceApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DEVICE_KEY] })
      message.success('Device berhasil diperbarui')
    },
    onError: () => message.error('Gagal memperbarui device'),
  })
}

export const useDeleteDevice = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()

  return useMutation({
    mutationFn: (id: string) =>
      deviceApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DEVICE_KEY] })
      message.success('Device berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus device'),
  })
}
