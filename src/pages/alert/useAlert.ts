import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import alertApi from '@/services/api/alert.api'
// import type { AlertFormValues } from '@/types/user.types'
import type { PaginationParams } from '@/types/api.types'
import { AlertSummaryByCategoryParams } from '@/types/alert.types'

export const ALERT_KEY = 'alerts'
export const ALERT_SUMMARY_KEY = 'alerts-summary-by-category'

export const useAlerts = (params?: PaginationParams) =>
  useQuery({
    queryKey: [ALERT_KEY, params],
    queryFn: () =>
      alertApi.getAll(params).then((r) => {
        // console.log('[useAlerts] response data:', r.data)
        return r.data
      }),
  })

export const useAlertSummaryByCategory = (
    params?: AlertSummaryByCategoryParams,
  ) =>
    useQuery({
      // search dimasukkan eksplisit ke queryKey supaya react-query
      // benar-benar refetch tiap kali equipment berubah, bukan cache lama
      queryKey: [
        ALERT_SUMMARY_KEY,
        params?.created_at,
        params?.created_at_end,
        params?.search,
      ],
      queryFn: () => {
        // console.log('[useAlertSummaryByCategory] queryFn params:', params)
        return alertApi.getSummaryByCategory(params).then((r) => r.data)
      },
      enabled: !!params?.created_at,
    })

// export const useCreateAlert = () => {
//   const qc = useQueryClient()
//   const { message } = App.useApp()
//   return useMutation({
//     mutationFn: (payload: AlertFormValues) =>
//       alertApi.create(payload).then((r) => r.data),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: [ALERT_KEY] })
//       message.success('Alert berhasil ditambahkan')
//     },
//     onError: () => message.error('Gagal menambahkan alert'),
//   })
// }

// export const useUpdateAlert = () => {
//   const qc = useQueryClient()
//   const { message } = App.useApp()
//   return useMutation({
//     mutationFn: ({ id, payload }: { id: string; payload: Partial<AlertFormValues> }) =>
//       alertApi.update(id, payload).then((r) => r.data),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: [ALERT_KEY] })
//       message.success('Alert berhasil diperbarui')
//     },
//     onError: () => message.error('Gagal memperbarui alert'),
//   })
// }

export const useMarkAlertAsRead = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      alertApi.markAsRead(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ALERT_KEY] })
    },
    onError: () => message.error('Gagal menandai alert sebagai dibaca'),
  })
}

export const useDeleteAlert = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      alertApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ALERT_KEY] })
      message.success('Alert berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus alert'),
  })
}
