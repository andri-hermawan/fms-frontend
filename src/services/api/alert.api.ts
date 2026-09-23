import { axiosInstance } from '@/services/http'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'
import { Alert, AlertAbnormalActivityData, AlertAbnormalActivityParams, AlertCategorySummary, AlertSummaryByCategoryParams, AlertSummaryByDateShiftItem, AlertSummaryByDateShiftParams } from '@/types/alert.types'



const alertApi = {
  getAll: (params?: PaginationParams) => {
    // console.log('[alertApi.getAll] params:', params)
    return axiosInstance.get<PaginatedResponse<Alert>>('/fms/api/alerts', { params })
  },

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Alert>>(`/fms/api/alerts/${id}`),

  // create: (payload: AlertFormValues) =>
  //   axiosInstance.post<ApiResponse<Alert>>('/fms/api/alerts', payload),

  // update: (id: string, payload: Partial<AlertFormValues>) =>
  //   axiosInstance.put<ApiResponse<Alert>>(`/fms/api/alerts/${id}`, payload),

  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/fms/api/alerts/${id}`),

  markAsRead: (id: string) =>
    axiosInstance.put<ApiResponse<Alert>>(`/fms/api/alerts/${id}/read`),

  getSummaryByCategory: (params?: AlertSummaryByCategoryParams) =>
    axiosInstance.get<ApiResponse<AlertCategorySummary[]>>(
      '/fms/api/alerts/summary_by_category',
      { params },
    ),

  getSummaryByDateShift: (params?: AlertSummaryByDateShiftParams) =>
    axiosInstance.get<ApiResponse<AlertSummaryByDateShiftItem[]>>(
      '/fms/api/alerts/summary_by_date_shift',
      { params },
    ),

  getAbnormalActivity: (params?: AlertAbnormalActivityParams) =>
    axiosInstance.get<ApiResponse<AlertAbnormalActivityData>>(
      '/fms/api/alerts/abnormal_activity',
      { params },
    ),
}

export default alertApi
