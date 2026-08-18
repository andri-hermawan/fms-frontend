import { axiosInstance } from '@/services/http'
import type { ApiResponse } from '@/types/api.types'
import type { EquipmentLog, EquipmentLogParams } from '@/types/equipment-logs.types'

const equipmentLogsApi = {
  getByDateShift: (params: EquipmentLogParams) =>
    axiosInstance.get<ApiResponse<EquipmentLog[]>>('/fms/api/equipment-logs/by-date-shift', { params }),
}

export default equipmentLogsApi