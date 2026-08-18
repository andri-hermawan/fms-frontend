import { axiosInstance } from '@/services/http'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  ActivitySummaryData,
  ActivitySummaryParams,
} from '@/types/tracking.types'

export interface VehiclePosition {
  id: string
  device_id: string
  equipment_id: string
  equipment_code: string
  equipment_alias: string
  equipment_type: string
  latitude: number
  longitude: number
  speed: number
  heading: number
  altitude: number
  fuel_level: number | null
  ignition: boolean
  movement_status: 'moving' | 'idle' | 'stopped'
  gps_accuracy: number | null
  recorded_at: string
  project_id: string
  project_name?: string
}

export interface GpsHistory {
  id: string
  equipment_id: string
  latitude: number
  longitude: number
  speed: number
  heading: number
  fuel_level: number | null
  ignition: boolean
  recorded_at: string
}

export interface TrackingHistoryParams {
  equipment_id: string
  start_date: string
  end_date: string
}

const trackingApi = {
  // Ambil posisi semua kendaraan (untuk polling)
  getAllPositions: (project_id?: string) =>
    axiosInstance.get<ApiResponse<VehiclePosition[]>>('/fms/api/tracking/positions', {
      params: project_id ? { project_id } : undefined,
    }),

  // Ambil posisi satu kendaraan
  getPositionByEquipment: (equipment_id: string) =>
    axiosInstance.get<ApiResponse<VehiclePosition>>(
      `/fms/api/tracking/positions/${equipment_id}`
    ),

  // Ambil history GPS per kendaraan per rentang waktu
  getHistory: (params: TrackingHistoryParams) =>
    axiosInstance.get<PaginatedResponse<GpsHistory>>('/fms/api/tracking/history', {
      params,
    }),

  // Ambil ringkasan aktivitas kendaraan (running/idle/mileage/fuel)
  getActivitySummary: (params: ActivitySummaryParams) =>
    axiosInstance.get<ApiResponse<ActivitySummaryData>>(
      '/fms/api/equipment-logs/activity_summary',
      { params },
    ),
}

export default trackingApi