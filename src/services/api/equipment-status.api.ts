import { axiosInstance } from '@/services/http'
import type { ApiResponse } from '@/types/api.types'
import type { EquipmentLiveStatus } from '@/types/equipment-status.types'

const equipmentStatusApi = {
  // Semua posisi live (polling)
  getLive: (project_id?: string) =>
    axiosInstance.get<ApiResponse<EquipmentLiveStatus[]>>(
      '/fms/api/equipment-status/live',
      { params: project_id ? { project_id } : undefined }
    ),

  // Posisi live satu equipment
  getLiveById: (equipment_id: string) =>
    axiosInstance.get<ApiResponse<EquipmentLiveStatus>>(
      `/fms/api/equipment-status/live/${equipment_id}`
    ),
}

export default equipmentStatusApi