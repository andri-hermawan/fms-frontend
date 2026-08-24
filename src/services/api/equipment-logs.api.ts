import { axiosInstance } from '@/services/http'
import type { ApiResponse } from '@/types/api.types'
import type { EquipmentLog, EquipmentLogParams, SegmentSpeedSummary } from '@/types/equipment-logs.types'

const equipmentLogsApi = {
  getByEquipmentDateShift: (params: EquipmentLogParams) =>
    axiosInstance.get<ApiResponse<EquipmentLog[]>>('/fms/api/equipment-logs/by-equipment-date-shift', { params }),
}

const equipmentLogsByDateShiftApi = {
  getByDateShift: (params: EquipmentLogParams) =>
    axiosInstance.get<ApiResponse<EquipmentLog[]>>('/fms/api/equipment-logs/by-date-shift', { params }),
}

const equipmentLogsAllApi = {
  getAll: (params?: EquipmentLogParams) =>
    axiosInstance.get<ApiResponse<EquipmentLog[]>>('/fms/api/equipment-logs', { params }),
}

const segmentSpeedSummaryApi = {
  getSegmentSpeedSummaryByDateShift: (params: EquipmentLogParams) =>
    axiosInstance.get<ApiResponse<SegmentSpeedSummary[]>>('/fms/api/equipment-logs/segment-speed-summary', { params }),
}

export { equipmentLogsByDateShiftApi, equipmentLogsAllApi, segmentSpeedSummaryApi }

export default equipmentLogsApi