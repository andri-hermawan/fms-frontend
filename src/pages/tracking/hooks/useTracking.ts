import { useEffect, useRef } from 'react'
import { useTrackingStore } from '@/stores/tracking.store'
import trackingApi from '@/services/api/tracking.api'
import env from '@/config/env'

const POLLING_INTERVAL = 10_000 // 10 detik

/**
 * Hook utama live tracking.
 * Mode polling: fetch /tracking/positions setiap 10 detik.
 * Mode socket: subscribe Socket.io event 'vehicle:position'.
 * Swap mode via VITE_REALTIME_MODE=polling|socket di .env
 */
const useTracking = (projectId?: string) => {
  const setBulkPositions = useTrackingStore((s) => s.setBulkPositions)
  const setPosition      = useTrackingStore((s) => s.setPosition)
  const setConnected     = useTrackingStore((s) => s.setConnected)
  const clearPositions   = useTrackingStore((s) => s.clearPositions)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const socketRef   = useRef<any>(null)

  // ─── Polling mode ──────────────────────────────────────────
  const startPolling = () => {
    const fetch = async () => {
      try {
        const { data } = await trackingApi.getAllPositions(projectId)
        if (Array.isArray(data.data)) {
          setBulkPositions(data.data)
          setConnected(true)
        }
      } catch {
        setConnected(false)
      }
    }

    fetch() // fetch langsung saat pertama mount
    intervalRef.current = setInterval(fetch, POLLING_INTERVAL)
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // ─── Socket mode ───────────────────────────────────────────
  const startSocket = async () => {
    try {
      const { io } = await import('socket.io-client')

      socketRef.current = io(env.socketUrl, {
        transports: ['websocket'],
        auth: {
          token: (await import('@/stores/auth.store')).useAuthStore.getState().accessToken,
        },
      })

      socketRef.current.on('connect', () => {
        setConnected(true)
        // Join room project jika ada
        if (projectId) {
          socketRef.current.emit('join:project', { project_id: projectId })
        }
      })

      socketRef.current.on('disconnect', () => setConnected(false))

      // Event posisi single kendaraan
      socketRef.current.on('vehicle:position', (pos: any) => {
        setPosition(pos)
      })

      // Event bulk posisi (saat pertama connect)
      socketRef.current.on('vehicle:positions', (positions: any[]) => {
        setBulkPositions(positions)
      })

    } catch (err) {
      console.error('[useTracking] Socket error, fallback ke polling', err)
      startPolling()
    }
  }

  const stopSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }

  // ─── Lifecycle ─────────────────────────────────────────────
  useEffect(() => {
    const mode = env.realtimeMode ?? 'polling'

    if (mode === 'socket') {
      startSocket()
    } else {
      startPolling()
    }

    return () => {
      stopPolling()
      stopSocket()
      setConnected(false)
      clearPositions()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  return {
    positions: useTrackingStore((s) => Object.values(s.positions)),
    isConnected: useTrackingStore((s) => s.isConnected),
    lastUpdated: useTrackingStore((s) => s.lastUpdated),
  }
}

export default useTracking