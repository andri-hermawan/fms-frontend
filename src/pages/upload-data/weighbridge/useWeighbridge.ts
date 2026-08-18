import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import weighbridgeApi from '@/services/api/weighbridge.api'
import type { WeighbridgeFormValues } from '@/types/weighbridge.types'
import type { PaginationParams } from '@/types/api.types'

export const WEIGHBRIDGE_KEY = 'weighbridge'

export const useWeighbridges = (params?: PaginationParams) =>
  useQuery({
    queryKey: [WEIGHBRIDGE_KEY, params],
    queryFn: () => weighbridgeApi.getAll(params).then((r) => r.data),
  })

export const useCreateWeighbridge = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: WeighbridgeFormValues) =>
      weighbridgeApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WEIGHBRIDGE_KEY] })
      message.success('Data weighbridge berhasil ditambahkan')
    },
    onError: () => message.error('Gagal menambahkan data weighbridge'),
  })
}

export const useUpdateWeighbridge = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<WeighbridgeFormValues> }) =>
      weighbridgeApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WEIGHBRIDGE_KEY] })
      message.success('Data weighbridge berhasil diperbarui')
    },
    onError: () => message.error('Gagal memperbarui data weighbridge'),
  })
}

export const useDeleteWeighbridge = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      weighbridgeApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WEIGHBRIDGE_KEY] })
      message.success('Data weighbridge berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus data weighbridge'),
  })
}

export const useImportWeighbridge = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (file: File) =>
      weighbridgeApi.importExcel(file).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [WEIGHBRIDGE_KEY] })
      message.success(
        `Import berhasil: ${data?.data?.imported ?? 0} baris`,
      )
    },
    onError: () => message.error('Gagal mengimport file excel'),
  })
}