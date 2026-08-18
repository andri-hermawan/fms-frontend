import { useEffect, useRef } from 'react'
import { useEquipmentStatusStore } from '@/stores/equipment-status.store'
import equipmentStatusApi from '@/services/api/equipment-status.api'
import type { EquipmentLiveStatus } from '@/types/equipment-status.types'

const POLLING_INTERVAL = 50_000

interface Options {
  projectId?: string
  enabled?: boolean
}

interface ResponseWithData {
  data: EquipmentLiveStatus[] | { data: EquipmentLiveStatus[] }
}

const extractList = (response: ResponseWithData): EquipmentLiveStatus[] => {
  if (Array.isArray(response.data)) return response.data
  if (
    response.data !== null &&
    typeof response.data === 'object' &&
    'data' in response.data &&
    Array.isArray(response.data.data)
  ) {
    return response.data.data
  }
  return []
}

const useEquipmentStatusLive = ({ projectId, enabled = true }: Options = {}) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Akses store via getState() — TIDAK subscribe, tidak trigger re-render
    const fetchPositions = async () => {
      try {
        console.log('[EquipmentLive] Fetching live positions...', { projectId })
        const response = await equipmentStatusApi.getLive(projectId)
        console.log('[EquipmentLive] API response:', response.data)

        // Axios response.data is the API envelope: { statusCode, message, data }.
        // Pass the envelope to extractList; passing the inner `data` array would
        // make extractList read `array.data` and return an empty list.
        const list = extractList(response.data as ResponseWithData)
        console.log('[EquipmentLive] Extracted positions:', list.length)

        // Pakai getState() lagi agar tidak stale closure
        useEquipmentStatusStore.getState().setBulkPositions(list)
        useEquipmentStatusStore.getState().setConnected(true)
        console.log(
          '[EquipmentLive] Store positions:',
          Object.keys(useEquipmentStatusStore.getState().positions).length,
        )
      } catch (error) {
        console.error('[EquipmentLive] Failed to fetch positions:', error)
        useEquipmentStatusStore.getState().setConnected(false)
      }
    }

    fetchPositions()
    intervalRef.current = setInterval(fetchPositions, POLLING_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      useEquipmentStatusStore.getState().setConnected(false)
      useEquipmentStatusStore.getState().clear()
    }
  // projectId dan enabled sebagai dependency — restart polling jika berubah
  }, [projectId, enabled])
}

export default useEquipmentStatusLive