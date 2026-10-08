import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import type { AxiosError } from 'axios'
import alertRuleApi from '@/services/api/alert-rule.api'
import type { AlertRulePayload, AlertRuleQueryParams } from '@/types/alert-rule.types'
import type { ApiError } from '@/types/api.types'

export const ALERT_RULE_KEY = 'alert-rules'

// Pesan validasi backend (mis. scope duplikat / segment tidak ditemukan) ditampilkan apa adanya
const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as AxiosError<ApiError>)?.response?.data?.message
  return Array.isArray(message) ? message.join(', ') : message || fallback
}

export const useAlertRules = (params?: AlertRuleQueryParams) =>
  useQuery({
    queryKey: [ALERT_RULE_KEY, params],
    queryFn: () => alertRuleApi.getAll(params).then((r) => r.data),
  })

export const useAlertRuleSegments = (projectId?: string | null) =>
  useQuery({
    queryKey: [ALERT_RULE_KEY, 'segments', projectId],
    queryFn: () => alertRuleApi.getSegments(projectId!).then((r) => r.data.data),
    enabled: !!projectId,
  })

export const useCreateAlertRule = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: AlertRulePayload) =>
      alertRuleApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ALERT_RULE_KEY] })
      message.success('Alert rule berhasil ditambahkan')
    },
    onError: (e) => message.error(errorMessage(e, 'Gagal menambahkan alert rule')),
  })
}

export const useUpdateAlertRule = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AlertRulePayload> }) =>
      alertRuleApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ALERT_RULE_KEY] })
      message.success('Alert rule berhasil diperbarui')
    },
    onError: (e) => message.error(errorMessage(e, 'Gagal memperbarui alert rule')),
  })
}

export const useDeleteAlertRule = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      alertRuleApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ALERT_RULE_KEY] })
      message.success('Alert rule berhasil dihapus')
    },
    onError: (e) => message.error(errorMessage(e, 'Gagal menghapus alert rule')),
  })
}
