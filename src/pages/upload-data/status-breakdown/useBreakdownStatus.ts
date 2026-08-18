import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import breakdownStatusApi from '@/services/api/breakdown-status.api'
import type { BreakdownStatusFormValues } from '@/types/breakdown-status.types'
import type { PaginationParams } from '@/types/api.types'

export const BREAKDOWN_STATUS_KEY = 'breakdown-status'

export const useBreakdownStatuses = (params?: PaginationParams) =>
  useQuery({
    queryKey: [BREAKDOWN_STATUS_KEY, params],
    queryFn: () => breakdownStatusApi.getAll(params).then((r) => r.data),
  })

export const useCreateBreakdownStatus = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: BreakdownStatusFormValues) =>
      breakdownStatusApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BREAKDOWN_STATUS_KEY] })
      message.success('Data breakdown status berhasil ditambahkan')
    },
    onError: () => message.error('Gagal menambahkan data breakdown status'),
  })
}

export const useUpdateBreakdownStatus = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BreakdownStatusFormValues> }) =>
      breakdownStatusApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BREAKDOWN_STATUS_KEY] })
      message.success('Data breakdown status berhasil diperbarui')
    },
    onError: () => message.error('Gagal memperbarui data breakdown status'),
  })
}

export const useDeleteBreakdownStatus = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      breakdownStatusApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BREAKDOWN_STATUS_KEY] })
      message.success('Data breakdown status berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus data breakdown status'),
  })
}

export const useImportBreakdownStatus = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (file: File) =>
      breakdownStatusApi.importExcel(file).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [BREAKDOWN_STATUS_KEY] })
      message.success(
        `Import berhasil: ${data?.data?.imported ?? 0} baris`,
      )
    },
    onError: () => message.error('Gagal mengimport file excel'),
  })
}