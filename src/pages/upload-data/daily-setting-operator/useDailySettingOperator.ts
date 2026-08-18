import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import dailySettingOperatorApi from '@/services/api/daily-setting-operator.api'
import type { DailySettingOperatorFormValues } from '@/types/daily-setting-operator.types'
import type { PaginationParams } from '@/types/api.types'

export const DAILY_SETTING_OPERATOR_KEY = 'setting-operator'

export const useDailySettingOperators = (params?: PaginationParams) =>
  useQuery({
    queryKey: [DAILY_SETTING_OPERATOR_KEY, params],
    queryFn: () => dailySettingOperatorApi.getAll(params).then((r) => r.data),
  })

export const useCreateDailySettingOperator = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: DailySettingOperatorFormValues) =>
      dailySettingOperatorApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DAILY_SETTING_OPERATOR_KEY] })
      message.success('Data setting operator berhasil ditambahkan')
    },
    onError: () => message.error('Gagal menambahkan data setting operator'),
  })
}

export const useUpdateDailySettingOperator = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<DailySettingOperatorFormValues> }) =>
      dailySettingOperatorApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DAILY_SETTING_OPERATOR_KEY] })
      message.success('Data setting operator berhasil diperbarui')
    },
    onError: () => message.error('Gagal memperbarui data setting operator'),
  })
}

export const useDeleteDailySettingOperator = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      dailySettingOperatorApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DAILY_SETTING_OPERATOR_KEY] })
      message.success('Data setting operator berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus data setting operator'),
  })
}

export const useImportDailySettingOperator = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (file: File) =>
      dailySettingOperatorApi.importExcel(file).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [DAILY_SETTING_OPERATOR_KEY] })
      message.success(
        `Import berhasil: ${data?.data?.imported ?? 0} baris`,
      )
    },
    onError: () => message.error('Gagal mengimport file excel'),
  })
}