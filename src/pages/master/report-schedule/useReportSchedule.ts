import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import type { AxiosError } from 'axios'
import reportScheduleApi from '@/services/api/report-schedule.api'
import type { ReportSchedulePayload, ReportScheduleQueryParams } from '@/types/report-schedule.types'
import type { ApiError } from '@/types/api.types'

export const REPORT_SCHEDULE_KEY = 'report-schedules'

// Pesan dari backend (validasi, SMTP belum diisi, dll) ditampilkan apa adanya
const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as AxiosError<ApiError>)?.response?.data?.message
  return Array.isArray(message) ? message.join(', ') : message || fallback
}

export const useReportSchedules = (params?: ReportScheduleQueryParams) =>
  useQuery({
    queryKey: [REPORT_SCHEDULE_KEY, params],
    queryFn: () => reportScheduleApi.getAll(params).then((r) => r.data),
  })

export const useReportTypes = () =>
  useQuery({
    queryKey: [REPORT_SCHEDULE_KEY, 'types'],
    queryFn: () => reportScheduleApi.getTypes().then((r) => r.data.data),
    staleTime: Infinity,
  })

export const useReportScheduleLogs = (id?: string) =>
  useQuery({
    queryKey: [REPORT_SCHEDULE_KEY, 'logs', id],
    queryFn: () => reportScheduleApi.getLogs(id!).then((r) => r.data.data),
    enabled: !!id,
  })

export const useCreateReportSchedule = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: ReportSchedulePayload) => reportScheduleApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REPORT_SCHEDULE_KEY] })
      message.success('Jadwal report berhasil ditambahkan')
    },
    onError: (error) => message.error(errorMessage(error, 'Gagal menambahkan jadwal report')),
  })
}

export const useUpdateReportSchedule = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ReportSchedulePayload> }) =>
      reportScheduleApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REPORT_SCHEDULE_KEY] })
      message.success('Jadwal report berhasil diperbarui')
    },
    onError: (error) => message.error(errorMessage(error, 'Gagal memperbarui jadwal report')),
  })
}

export const useDeleteReportSchedule = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) => reportScheduleApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REPORT_SCHEDULE_KEY] })
      message.success('Jadwal report berhasil dihapus')
    },
    onError: (error) => message.error(errorMessage(error, 'Gagal menghapus jadwal report')),
  })
}

export const useSendReportNow = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  // Render PDF + kirim email bisa puluhan detik: tampilkan status berjalan, lalu ganti hasilnya.
  const key = 'send-report-now'
  return useMutation({
    mutationFn: (id: string) => reportScheduleApi.sendNow(id).then((r) => r.data),
    onMutate: () => {
      message.loading({ content: 'Membuat PDF dan mengirim email, mohon tunggu...', key, duration: 0 })
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [REPORT_SCHEDULE_KEY] })
      const total = res?.data?.recipients
      message.success({
        content: total ? `Report berhasil dikirim ke ${total} penerima` : 'Report berhasil dikirim',
        key,
        duration: 6,
      })
    },
    onError: (error) =>
      message.error({ content: errorMessage(error, 'Gagal mengirim report'), key, duration: 8 }),
  })
}
