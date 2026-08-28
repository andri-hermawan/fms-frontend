import { createElement, Fragment, useEffect, useRef } from 'react'
import io, { Socket } from 'socket.io-client'
import { useEquipmentStatusStore } from '@/stores/equipment-status.store'
import { useAlertStore } from '@/stores/alert.store'
import { SOCKET_CONFIG } from '@/config/socket'
import queryClient from '@/config/queryClient'
import { ALERT_SUMMARY_KEY } from '@/pages/alert/useAlert'
import type { EquipmentLiveStatus } from '@/types/equipment-status.types'
import type { Alert, AlertCategorySummary } from '@/types/alert.types'
import { message } from 'antd'

interface ResponseWithData {
  data: EquipmentLiveStatus[] | { data: EquipmentLiveStatus[] }
}

const extractList = (response: ResponseWithData): EquipmentLiveStatus[] => {
  if (Array.isArray(response)) return response
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

const extractEquipmentList = (response: any): EquipmentLiveStatus[] => {
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.equipments)) return response.data.equipments
  if (Array.isArray(response?.equipments)) return response.equipments
  return extractList(response)
}

// Returns the AlertCategorySummary[] array no matter how the socket/API wraps
// it (raw array, { data: [...] }, or { data: { data: [...] } }).
const extractAlertSummaryList = (response: unknown): AlertCategorySummary[] => {
  if (Array.isArray(response)) return response as AlertCategorySummary[]
  const r = response as Record<string, unknown> | null
  if (!r || typeof r !== 'object') return []
  if (Array.isArray(r.data)) return r.data as AlertCategorySummary[]
  if (
    r.data &&
    typeof r.data === 'object' &&
    Array.isArray((r.data as Record<string, unknown>).data)
  ) {
    return (r.data as Record<string, unknown>).data as AlertCategorySummary[]
  }
  return []
}

interface EquipmentStatusUpdateData {
  equipment_id: string
  log_id: string
  equipment_code: string
  equipment_alias: string
  equipment_type: string
  project_id: string
  project_code?: string
  project_name?: string
  latitude: number
  longitude: number
  location_category: string
  segment: string
  speed: number
  heading: number
  altitude?: number
  fuel_level: number
  fuel_temperature: number
  fuel_volume: number
  fuel_percentage: number
  fuel_difference: number
  alert_count: number
  vessel: number
  engine_status: boolean
  status: 'OFFLINE' | 'IDLE' | 'MOVING'
  vessel_status: string
  recorded_at: string
  device_code?: string
}

interface NewAlertData {
  id: string
  equipment_id: string
  equipment_code?: string
  log_id: string
  alert_category_id: number
  alert_category_name?: string
  latitude: number
  longitude: number
  is_inside: boolean
  orig_fid: number
  location_category: string
  segment: string
  speed: number
  fuel_level: number
  vessel: string
  millege: number
  vessel_status: string
  engine_status: boolean
  is_read: boolean
  status: 'Overspeed' | 'Underspeed' | 'Offtrack' | 'Fuel Decrease'
  created_at: string
  metadata?: Record<string, unknown>
}

interface NewEquipmentLogData {
  log_id: string
  equipment_id: string
  equipment_code: string
  event_type: string
  timestamp: string
  details: Record<string, unknown>
}

interface FuelEventData {
  equipment_id: string
  equipment_code: string
  event_type: 'refuel' | 'drain' | 'low'
  fuel_before: number
  fuel_after: number
  fuel_change: number
  timestamp: string
  location?: {
    latitude: number
    longitude: number
  }
}

export interface GeofenceEventData {
  equipment_id: string
  equipment_code: string
  geofence_id: string
  geofence_name?: string
  event?: 'IN' | 'OUT'
  event_type?: 'enter' | 'exit'
  timestamp?: string
  created_at?: string
  latitude?: number
  longitude?: number
  location?: {
    latitude: number
    longitude: number
  }
}

interface UseSocketTrackingOptions {
  onGeofenceEvent?: (data: GeofenceEventData) => void
}

const useSocketTracking = (options?: UseSocketTrackingOptions) => {
  const socketRef = useRef<Socket | null>(null)
  const geofenceEventHandlerRef = useRef(options?.onGeofenceEvent)

  geofenceEventHandlerRef.current = options?.onGeofenceEvent

  useEffect(() => {
    // console.log('🔌 Connecting to Socket.IO server:', SOCKET_CONFIG.url)

    // Initialize socket connection
    const socket = io(SOCKET_CONFIG.url, {
      ...SOCKET_CONFIG.options,
      autoConnect: false,
    })

    socketRef.current = socket

    // Connection events
    socket.on(SOCKET_CONFIG.events.CONNECT, () => {
      // console.log('✅ Socket.IO connected:', socket.id)
      // console.log('🔍 Waiting for initial-data event from backend...')
      useEquipmentStatusStore.getState().setConnected(true)
    })

    // Listen for initial data from backend
    socket.on('initial-data', (data: any) => {
      // console.log('📥 Received initial-data event from backend!')
      // console.log('📥 Raw initial data:', data)
      const list = extractEquipmentList(data)
      // console.log('📥 Extracted list length:', list.length)
      // console.log('📥 Extracted list:', list)
      useEquipmentStatusStore.getState().setBulkPositions(list)
      useEquipmentStatusStore.getState().setConnected(true)
      // console.log('✅ Initial data loaded from socket:', list.length, 'equipments')
      // console.log(
      //   '📦 positionsMap after initial-data:',
      //   useEquipmentStatusStore.getState().positions,
      // )
    })

    socket.on('initial-data-error', (error: unknown) => {
      console.error('❌ Backend failed to provide initial data:', error)
    })

    // Debug: Log ALL events received from socket
    socket.onAny((eventName, ...args) => {
      console.log(`🔔 Socket event received: "${eventName}"`, args)
    })

    socket.on(SOCKET_CONFIG.events.DISCONNECT, (reason) => {
      console.log('❌ Socket.IO disconnected:', reason)
      useEquipmentStatusStore.getState().setConnected(false)
    })

    socket.on(SOCKET_CONFIG.events.CONNECT_ERROR, (error) => {
      console.error('🚫 Socket.IO connection error:', error.message)
      useEquipmentStatusStore.getState().setConnected(false)
    })

    socket.on(SOCKET_CONFIG.events.RECONNECT, (attemptNumber) => {
      console.log('🔄 Socket.IO reconnected after', attemptNumber, 'attempts')
      useEquipmentStatusStore.getState().setConnected(true)
    })

    socket.on(SOCKET_CONFIG.events.RECONNECT_ATTEMPT, (attemptNumber) => {
      console.log('🔄 Socket.IO reconnection attempt:', attemptNumber)
    })

    socket.on(SOCKET_CONFIG.events.RECONNECT_ERROR, (error) => {
      console.error('🚫 Socket.IO reconnection error:', error.message)
    })

    socket.on(SOCKET_CONFIG.events.RECONNECT_FAILED, () => {
      console.error('💥 Socket.IO reconnection failed')
    })

    // Connect only after all listeners are registered. The backend emits
    // initial-data immediately from handleConnection().
    // console.log('🔌 Starting Socket.IO connection after registering listeners')
    socket.connect()

    // Equipment status update
    socket.on(SOCKET_CONFIG.events.EQUIPMENT_STATUS_UPDATE, (data: EquipmentStatusUpdateData) => {
      console.log('📍 Equipment Status Update:', data)
      // console.log('  - Equipment:', data.equipment_code)
      // console.log('  - Alias:', data.equipment_alias)
      // console.log('  - Location:', data.latitude, data.longitude)
      // console.log('  - Speed:', data.speed, 'km/h')
      // console.log('  - Heading:', data.heading, '°')
      // console.log('  - Status:', data.status)
      // console.log('  - Fuel Level:', data.fuel_level, '%')
      // console.log('  - Fuel Volume:', data.fuel_volume, 'L')
      // console.log('  - Engine Status:', data.engine_status ? 'ON' : 'OFF')
      // console.log('  - Recorded At:', data.recorded_at)
      
      // message.info(
      //   createElement(
      //     Fragment,
      //     null,
      //     'Unit ',
      //     createElement('strong', null, data.equipment_code),
      //     ' sedang dalam mode ',
      //     createElement('strong', null, data.status),
      //     ' berada di lokasi ',
      //     createElement('strong', null, data.location_category ?? '-'),
      //     ', Segment ',
      //     createElement('strong', null, data.segment ?? '-'),
      //     ', dengan kecepatan ',
      //     createElement('strong', null, `${data.speed ?? 0} km/h`),
      //     ' dan membawa muatan ',
      //     createElement('strong', null, data.vessel_status ?? '-'),
      //     '.',
      //   ),
      // );

      // Update equipment status in store
      // gsm_signal & breakdown tidak dikirim socket → pertahankan nilai lama
      // dari store agar ikon (offline/breakdown) tidak berubah.
      const prev = useEquipmentStatusStore.getState().positions[
        data.equipment_id
      ]

      const equipmentStatus: EquipmentLiveStatus = {
        equipment_id: data.equipment_id,
        log_id: data.log_id,
        equipment_code: data.equipment_code,
        equipment_alias: data.equipment_alias,
        equipment_type: data.equipment_type,
        project_id: data.project_id,
        project_code: data.project_code,
        project_name: data.project_name,
        latitude: data.latitude,
        longitude: data.longitude,
        segment: data.segment,
        speed: data.speed,
        heading: data.heading,
        altitude: data.altitude,
        fuel_level: data.fuel_level,
        fuel_temperature: data.fuel_temperature,
        fuel_volume: data.fuel_volume,
        fuel_percentage: data.fuel_percentage,
        fuel_difference: data.fuel_difference,
        alert_count: data.alert_count,
        vessel: data.vessel,
        engine_status: data.engine_status,
        status: data.status,
        vessel_status: data.vessel_status,
        gsm_signal: prev?.gsm_signal ?? 0,
        breakdown: prev?.breakdown ?? false,
        recorded_at: data.recorded_at,
        device_code: data.device_code,
      }

      useEquipmentStatusStore.getState().setPosition(equipmentStatus)
    })

    // New alert
    socket.on(SOCKET_CONFIG.events.NEW_ALERT, (data: NewAlertData) => {
      console.log('🚨 New Alert:', data)
      // console.log('  - Equipment:', data.equipment_code || data.equipment_id)
      // console.log('  - Status:', data.status)
      // console.log('  - Category:', data.alert_category_name || data.alert_category_id)
      // console.log('  - Location:', data.latitude, data.longitude)
      // console.log('  - Speed:', data.speed, 'km/h')
      // console.log('  - Timestamp:', data.created_at)

      // Add alert to store
      const alert: Alert = {
        id: data.id,
        equipment_id: data.equipment_id,
        equipments: data.equipment_code ? {
          equipment_code: data.equipment_code
        } : undefined,
        log_id: data.log_id,
        alert_category_id: data.alert_category_id,
        alert_categories: data.alert_category_name ? {
          alert_category_name: data.alert_category_name
        } : undefined,
        latitude: data.latitude,
        longitude: data.longitude,
        is_inside: data.is_inside,
        orig_fid: data.orig_fid,
        location_category: data.location_category,
        segment: data.segment,
        speed: data.speed,
        fuel_level: data.fuel_level,
        vessel: data.vessel,
        millege: data.millege,
        vessel_status: data.vessel_status,
        engine_status: data.engine_status,
        status: data.status,
        created_at: data.created_at,
        resolved_at: '',
        is_read: data.is_read,
        metadata: data.metadata || {},
      }

      useAlertStore.getState().addAlert(alert)

      // The summary is loaded by React Query, so update its active query as
      // soon as Socket.IO announces a new alert. This avoids requiring a
      // manual page refresh while keeping the data source realtime.
      void queryClient.invalidateQueries({
        queryKey: [ALERT_SUMMARY_KEY],
        refetchType: 'active',
      })
    })

    // Alert summary update
    // Drives the AlertSectionsPanel on the TrackingPage. The panel reads the
    // ALERT_SUMMARY_KEY query via useAlertSummaryByCategory, so invalidating
    // the query here makes it refetch the latest summary in realtime.
    socket.on(SOCKET_CONFIG.events.ALERT_SUMMARY_UPDATE, (data: unknown) => {
      console.log('📊 Alert Summary Update:', data)

      const list = extractAlertSummaryList(data)
      if (list.length > 0) {
        // Push the exact socket payload into the store so AlertSectionsPanel
        // renders the same duration/value the backend sent.
        useAlertStore.getState().setSummary(list)

        // Also keep the React Query cache in sync for the active query.
        void queryClient.invalidateQueries({
          queryKey: [ALERT_SUMMARY_KEY],
          refetchType: 'active',
        })
      }
    })

    // New equipment log
    socket.on(SOCKET_CONFIG.events.NEW_EQUIPMENT_LOG, (data: NewEquipmentLogData) => {
      console.log('📝 New Equipment Log:', data)
      // console.log('  - Equipment:', data.equipment_code)
      // console.log('  - Event Type:', data.event_type)
      // console.log('  - Timestamp:', data.timestamp)
      // console.log('  - Details:', data.details)
    })

    // Fuel event
    socket.on(SOCKET_CONFIG.events.FUEL_EVENT, (data: FuelEventData) => {
      console.log('⛽ Fuel Event:', data)
      // console.log('  - Equipment:', data.equipment_code)
      // console.log('  - Event Type:', data.event_type)
      // console.log('  - Fuel Change:', data.fuel_change, 'L')
      // console.log('  - Before:', data.fuel_before, 'L')
      // console.log('  - After:', data.fuel_after, 'L')
      // console.log('  - Timestamp:', data.timestamp)

      // You can create a toast notification or update UI here
      if (data.event_type === 'low') {
        console.warn('⚠️ Low fuel alert for', data.equipment_code)
      }
    })

    // Geofence event
    socket.on(SOCKET_CONFIG.events.GEOFENCE_EVENT, (data: GeofenceEventData) => {
      console.log('🗺️ Geofence Event:', data)
      // console.log('  - Equipment:', data.equipment_code)
      // console.log('  - Geofence:', data.geofence_name)
      // console.log('  - Event Type:', data.event_type ?? data.event)
      // console.log(
      //   '  - Location:',
      //   data.location?.latitude ?? data.latitude,
      //   data.location?.longitude ?? data.longitude,
      // )
      // console.log('  - Timestamp:', data.timestamp ?? data.created_at)

      // You can create a notification or highlight on map here
      if (data.event_type === 'exit' || data.event === 'OUT') {
        console.warn('⚠️', data.equipment_code, 'exited geofence:', data.geofence_name)
      }

      geofenceEventHandlerRef.current?.(data)
    })

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting Socket.IO')
      socket.off(SOCKET_CONFIG.events.CONNECT)
      socket.off(SOCKET_CONFIG.events.DISCONNECT)
      socket.off(SOCKET_CONFIG.events.CONNECT_ERROR)
      socket.off(SOCKET_CONFIG.events.RECONNECT)
      socket.off(SOCKET_CONFIG.events.RECONNECT_ATTEMPT)
      socket.off(SOCKET_CONFIG.events.RECONNECT_ERROR)
      socket.off(SOCKET_CONFIG.events.RECONNECT_FAILED)
      socket.off(SOCKET_CONFIG.events.EQUIPMENT_STATUS_UPDATE)
      socket.off(SOCKET_CONFIG.events.NEW_ALERT)
      socket.off(SOCKET_CONFIG.events.ALERT_SUMMARY_UPDATE)
      socket.off(SOCKET_CONFIG.events.NEW_EQUIPMENT_LOG)
      socket.off(SOCKET_CONFIG.events.FUEL_EVENT)
      socket.off(SOCKET_CONFIG.events.GEOFENCE_EVENT)
      socket.disconnect()
      socketRef.current = null
      
      // JANGAN clear data saat unmount - biarkan data tetap ada
      // useEquipmentStatusStore.getState().clear()
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
  }
}

export default useSocketTracking
