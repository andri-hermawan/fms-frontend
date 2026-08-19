import { useQuery } from '@tanstack/react-query'
import equipmentLogsApi, { equipmentLogsByDateShiftApi, segmentSpeedSummaryApi } from '@/services/api/equipment-logs.api'
import type { EquipmentLogParams, SegmentSpeedSummary } from '@/types/equipment-logs.types'
import type { ApiResponse } from '@/types/api.types'

const useEquipmentLogs = (params: EquipmentLogParams | null) => {
  return useQuery({
    queryKey: ['equipment-logs', params],
    queryFn: () => {
      if (!params) return Promise.resolve(null)
      return equipmentLogsApi.getByEquipmentDateShift(params).then((r) => r.data)
    },
    enabled: !!params,
  })
}

export const useEquipmentLogsByDateShift = (params: Pick<EquipmentLogParams, 'created_at' | 'shift'> | null) => {
  return useQuery({
    queryKey: ['equipment-logs-by-date-shift', params],
    queryFn: () => {
      if (!params) return Promise.resolve(null)
      return equipmentLogsByDateShiftApi.getByDateShift(params).then((r) => r.data)
    },
    enabled: !!params,
  })
}

export const useSegmentSpeedSummary = (params: Pick<EquipmentLogParams, 'created_at' | 'shift'> | null) => {
  return useQuery({
    queryKey: ['segment-speed-summary', params],
    queryFn: () => {
      if (!params) return Promise.resolve(null)
      console.log('[useSegmentSpeedSummary] params:', params)
      return segmentSpeedSummaryApi.getSegmentSpeedSummaryByDateShift(params).then((r) => {
        console.log('[useSegmentSpeedSummary] response:', r.data)
        return r.data as ApiResponse<SegmentSpeedSummary[]>
      })
    },
    enabled: !!params,
  })
}

export default useEquipmentLogs