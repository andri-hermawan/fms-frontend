import { useQuery } from '@tanstack/react-query'
import equipmentLogsApi from '@/services/api/equipment-logs.api'
import type { EquipmentLogParams } from '@/types/equipment-logs.types'

const useEquipmentLogs = (params: EquipmentLogParams | null) => {
  return useQuery({
    queryKey: ['equipment-logs', params],
    queryFn: () => {
      if (!params) return Promise.resolve(null)
      console.log('[useEquipmentLogs] params:', params)
      return equipmentLogsApi.getByDateShift(params).then((r) => {
        console.log('[useEquipmentLogs] response data count:', r.data?.data?.length, 'data:', r.data?.data)
        return r.data
      })
    },
    enabled: !!params,
  })
}

export default useEquipmentLogs