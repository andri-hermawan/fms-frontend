import { axiosInstance } from '@/services/http'
import type {
  AlertRule,
  AlertRulePayload,
  AlertRuleQueryParams,
  AlertRuleSegment,
} from '@/types/alert-rule.types'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'

const alertRuleApi = {
  getAll: (params?: AlertRuleQueryParams) =>
    axiosInstance.get<PaginatedResponse<AlertRule>>('/fms/api/alert-rules', { params }),
  getSegments: (projectId: string) =>
    axiosInstance.get<ApiResponse<AlertRuleSegment[]>>('/fms/api/alert-rules/segments', {
      params: { project_id: projectId },
    }),
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<AlertRule>>(`/fms/api/alert-rules/${id}`),
  create: (payload: AlertRulePayload) =>
    axiosInstance.post<ApiResponse<AlertRule>>('/fms/api/alert-rules', payload),
  update: (id: string, payload: Partial<AlertRulePayload>) =>
    axiosInstance.patch<ApiResponse<AlertRule>>(`/fms/api/alert-rules/${id}`, payload),
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/fms/api/alert-rules/${id}`),
}
export default alertRuleApi
