import { axiosInstance } from '@/services/http'
import type {
  ReportSchedule,
  ReportScheduleLog,
  ReportSchedulePayload,
  ReportScheduleQueryParams,
  ReportType,
} from '@/types/report-schedule.types'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'

const BASE = '/fms/api/report-schedules'

const reportScheduleApi = {
  getAll: (params?: ReportScheduleQueryParams) =>
    axiosInstance.get<PaginatedResponse<ReportSchedule>>(BASE, { params }),
  getTypes: () => axiosInstance.get<ApiResponse<ReportType[]>>(`${BASE}/types`),
  getLogs: (id: string) =>
    axiosInstance.get<ApiResponse<ReportScheduleLog[]>>(`${BASE}/${id}/logs`),
  create: (payload: ReportSchedulePayload) =>
    axiosInstance.post<ApiResponse<ReportSchedule>>(BASE, payload),
  update: (id: string, payload: Partial<ReportSchedulePayload>) =>
    axiosInstance.patch<ApiResponse<ReportSchedule>>(`${BASE}/${id}`, payload),
  delete: (id: string) => axiosInstance.delete<ApiResponse<null>>(`${BASE}/${id}`),
  sendNow: (id: string) =>
    // Render PDF + kirim email bisa lebih dari timeout default 15 detik.
    axiosInstance.post<ApiResponse<{ sent: boolean; recipients: number }>>(`${BASE}/${id}/send-now`, {}, {
      timeout: 120_000,
    }),
}

export default reportScheduleApi
