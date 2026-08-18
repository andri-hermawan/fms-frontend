import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import shiftApi from '@/services/api/shift.api'
import type { ShiftFormValues } from '@/types/shift.types'
import type { PaginationParams } from '@/types/api.types'

export const SHIFT_KEY = 'shifts'

export const useShifts = (params?: PaginationParams) =>
  useQuery({
    queryKey: [SHIFT_KEY, params],
    queryFn: () => shiftApi.getAll(params).then((r) => r.data),
  })

export const useCurrentShift = (projectId?: string, currentTime?: string) =>
  useQuery({
    queryKey: [SHIFT_KEY, 'current', projectId, currentTime],
    queryFn: () => shiftApi.getCurrentByProject(projectId!, currentTime).then((r) => r.data?.data?.shift),
    enabled: !!projectId,
  })

export const useCreateShift = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: ShiftFormValues) =>
      shiftApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SHIFT_KEY] })
      message.success('Shift berhasil ditambahkan')
    },
    onError: () => message.error('Gagal menambahkan shift'),
  })
}

export const useUpdateShift = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ShiftFormValues> }) =>
      shiftApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SHIFT_KEY] })
      message.success('Shift berhasil diperbarui')
    },
    onError: () => message.error('Gagal memperbarui shift'),
  })
}

export const useDeleteShift = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      shiftApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SHIFT_KEY] })
      message.success('Shift berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus shift'),
  })
}
