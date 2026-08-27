import createLeafletIcon from './createLeafletIcon'

import idleEmpty from '@/assets/markers/idle_empty.png'
import idleEmptyAlert from '@/assets/markers/idle_empty_alert.png'
import idleEmptyBreakdown from '@/assets/markers/Idle_Empty_Breakdown.png'
import idleEmptyOffline from '@/assets/markers/Idle_Empty_Offline.png'
import idleEmptyAlertBreakdown from '@/assets/markers/Idle_Empty_2Combine_Alert_Breakdown.png'
import idleEmptyAlertOffline from '@/assets/markers/Idle_Empty_2Combine_Alert_Offline.png'
import idleEmptyOfflineBreakdown from '@/assets/markers/Idle_Empty_2Combine_Offline_Breakdown.png'
import idleEmptyAlertOfflineBreakdown from '@/assets/markers/Idle_Empty_3Combine_Alert_Offline_Breakdown.png'
import idleLoaded from '@/assets/markers/Idle_Loaded.png'
import idleLoadedAlert from '@/assets/markers/Idle_Loaded_Alert.png'
import idleLoadedBreakdown from '@/assets/markers/Idle_Loaded_Breakdown.png'
import idleLoadedOffline from '@/assets/markers/Idle_Loaded_Offline.png'
import idleLoadedAlertBreakdown from '@/assets/markers/Idle_Loaded _2Combine_Alert_Breakdown.png'
import idleLoadedAlertOffline from '@/assets/markers/Idle_Loaded_2Combine_Alert_Offline.png'
import idleLoadedOfflineBreakdown from '@/assets/markers/Idle_Loaded _2Combine_Offline_Breakdown.png'
import idleLoadedAlertOfflineBreakdown from '@/assets/markers/Idle_Loaded _3Combine_Alert_Offline_Breakdown.png'
import idleUnknown from '@/assets/markers/Idle_Unknown.png'
import idleUnknownAlert from '@/assets/markers/Idle_Unknown_Alert.png'
import idleUnknownBreakdown from '@/assets/markers/Idle_Unknown_Breakdown.png'
import idleUnknownOffline from '@/assets/markers/Idle_Unknown_Offline.png'
import idleUnknownAlertBreakdown from '@/assets/markers/Idle_Unknown_2Combine_Alert_Breakdown.png'
import idleUnknownAlertOffline from '@/assets/markers/Idle_Unknown_2Combine_Alert_Offline.png'
import idleUnknownOfflineBreakdown from '@/assets/markers/Idle_Unknown_2Combine_Offline_Breakdown.png'
import idleUnknownAlertOfflineBreakdown from '@/assets/markers/Idle_Unknown_3Combine_Alert_Offline_Breakdown.png'

import runningEmpty from '@/assets/markers/running_empty.png'
import runningEmptyAlert from '@/assets/markers/running_empty_alert.png'
import runningEmptyBreakdown from '@/assets/markers/Running_Empty_Breakdown.png'
import runningEmptyOffline from '@/assets/markers/Running_Empty_Offline.png'
import runningEmptyAlertBreakdown from '@/assets/markers/Running_Empty_2Combine_Alert_Breakdown.png'
import runningEmptyAlertOffline from '@/assets/markers/Running_Empty_2Combine_Alert_Offline.png'
import runningEmptyOfflineBreakdown from '@/assets/markers/Running_Empty_2Combine_Offline_Breakdown.png'
import runningEmptyAlertOfflineBreakdown from '@/assets/markers/Running_Empty_3Combine_Alert_Offline_Breakdown.png'
import runningLoaded from '@/assets/markers/Running_Loaded.png'
import runningLoadedAlert from '@/assets/markers/Running_Loaded _Alert.png'
import runningLoadedBreakdown from '@/assets/markers/Running_Loaded _Breakdown.png'
import runningLoadedOffline from '@/assets/markers/Running_Loaded _Offline.png'
import runningLoadedAlertBreakdown from '@/assets/markers/Running_Loaded _2Combine_Alert_Breakdown.png'
import runningLoadedAlertOffline from '@/assets/markers/Running_Loaded_2Combine_Alert_Offline.png'
import runningLoadedOfflineBreakdown from '@/assets/markers/Running_Loaded _2Combine_Offline_Breakdown.png'
import runningLoadedAlertOfflineBreakdown from '@/assets/markers/Running_Loaded _3Combine_Alert_Offline_Breakdown.png'
import runningUnknown from '@/assets/markers/Running_Unknown.png'
import runningUnknownAlert from '@/assets/markers/Running_Unknown_Alert.png'
import runningUnknownBreakdown from '@/assets/markers/Running_Unknown_Breakdown.png'
import runningUnknownOffline from '@/assets/markers/Running_Unknown_Offline.png'
import runningUnknownAlertBreakdown from '@/assets/markers/Running_Unknown_2Combine_Alert_Breakdown.png'
import runningUnknownAlertOffline from '@/assets/markers/Running_Unknown_2Combine_Alert_Offline.png'
import runningUnknownOfflineBreakdown from '@/assets/markers/Running_Unknown_2Combine_Offline_Breakdown.png'
import runningUnknownAlertOfflineBreakdown from '@/assets/markers/Running_Unknown_3Combine_Alert_Offline_Breakdown.png'

import stopEmpty from '@/assets/markers/stop_empty.png'
import stopEmptyAlert from '@/assets/markers/stop_empty_alert.png'
import stopEmptyBreakdown from '@/assets/markers/Stop_Empty_Breakdown.png'
import stopEmptyOffline from '@/assets/markers/Stop_Empty_Offline.png'
import stopEmptyAlertBreakdown from '@/assets/markers/Stop_Empty_2Combine_Alert_Breakdown.png'
import stopEmptyAlertOffline from '@/assets/markers/Stop_Empty_2Combine_Alert_Offline.png'
import stopEmptyOfflineBreakdown from '@/assets/markers/Stop_Empty_2Combine_Offline_Breakdown.png'
import stopEmptyAlertOfflineBreakdown from '@/assets/markers/Stop_Empty_3Combine_Alert_Offline_Breakdown.png'
import stopLoaded from '@/assets/markers/Stop_Loaded.png'
import stopLoadedAlert from '@/assets/markers/Stop_Loaded_Alert.png'
import stopLoadedBreakdown from '@/assets/markers/Stop_Loaded_Breakdown.png'
import stopLoadedOffline from '@/assets/markers/Stop_Loaded_Offline.png'
import stopLoadedAlertBreakdown from '@/assets/markers/Stop_Loaded_2Combine_Alert_Breakdown.png'
import stopLoadedAlertOffline from '@/assets/markers/Stop_Loaded_2Combine_Alert_Offline.png'
import stopLoadedOfflineBreakdown from '@/assets/markers/Stop_Loaded_2Combine_Offline_Breakdown.png'
import stopLoadedAlertOfflineBreakdown from '@/assets/markers/Stop_Loaded_3Combine_Alert_Offline_Breakdown.png'
import stopUnknown from '@/assets/markers/Stop_Unknown.png'
import stopUnknownAlert from '@/assets/markers/Stop_Unknown_Alert.png'
import stopUnknownBreakdown from '@/assets/markers/Stop_Unknown_Breakdown.png'
import stopUnknownOffline from '@/assets/markers/Stop_Unknown_Offline.png'
import stopUnknownAlertBreakdown from '@/assets/markers/Stop_Unknown_2Combine_Alert_Breakdown.png'
import stopUnknownAlertOffline from '@/assets/markers/Stop_Unknown_2Combine_Alert_Offline.png'
import stopUnknownOfflineBreakdown from '@/assets/markers/Stop_Unknown_2Combine_Offline_Breakdown.png'
import stopUnknownAlertOfflineBreakdown from '@/assets/markers/Stop_Unknown_3Combine_Alert_Offline_Breakdown.png'

import type { EquipmentMarkerData } from '@/types/map.types'

type MarkerIconSet = Record<
  'normal' | 'alert' | 'breakdown' | 'offline' | 'alertBreakdown' | 'alertOffline' | 'offlineBreakdown' | 'alertOfflineBreakdown',
  string
>

const iconSet = (
  normal: string, alert: string, breakdown: string, offline: string,
  alertBreakdown: string, alertOffline: string, offlineBreakdown: string,
  alertOfflineBreakdown: string,
): MarkerIconSet => ({ normal, alert, breakdown, offline, alertBreakdown, alertOffline, offlineBreakdown, alertOfflineBreakdown })

const ICONS = {
  running: {
    empty: iconSet(runningEmpty, runningEmptyAlert, runningEmptyBreakdown, runningEmptyOffline, runningEmptyAlertBreakdown, runningEmptyAlertOffline, runningEmptyOfflineBreakdown, runningEmptyAlertOfflineBreakdown),
    loaded: iconSet(runningLoaded, runningLoadedAlert, runningLoadedBreakdown, runningLoadedOffline, runningLoadedAlertBreakdown, runningLoadedAlertOffline, runningLoadedOfflineBreakdown, runningLoadedAlertOfflineBreakdown),
    unknown: iconSet(runningUnknown, runningUnknownAlert, runningUnknownBreakdown, runningUnknownOffline, runningUnknownAlertBreakdown, runningUnknownAlertOffline, runningUnknownOfflineBreakdown, runningUnknownAlertOfflineBreakdown),
  },
  idle: {
    empty: iconSet(idleEmpty, idleEmptyAlert, idleEmptyBreakdown, idleEmptyOffline, idleEmptyAlertBreakdown, idleEmptyAlertOffline, idleEmptyOfflineBreakdown, idleEmptyAlertOfflineBreakdown),
    loaded: iconSet(idleLoaded, idleLoadedAlert, idleLoadedBreakdown, idleLoadedOffline, idleLoadedAlertBreakdown, idleLoadedAlertOffline, idleLoadedOfflineBreakdown, idleLoadedAlertOfflineBreakdown),
    unknown: iconSet(idleUnknown, idleUnknownAlert, idleUnknownBreakdown, idleUnknownOffline, idleUnknownAlertBreakdown, idleUnknownAlertOffline, idleUnknownOfflineBreakdown, idleUnknownAlertOfflineBreakdown),
  },
  stop: {
    empty: iconSet(stopEmpty, stopEmptyAlert, stopEmptyBreakdown, stopEmptyOffline, stopEmptyAlertBreakdown, stopEmptyAlertOffline, stopEmptyOfflineBreakdown, stopEmptyAlertOfflineBreakdown),
    loaded: iconSet(stopLoaded, stopLoadedAlert, stopLoadedBreakdown, stopLoadedOffline, stopLoadedAlertBreakdown, stopLoadedAlertOffline, stopLoadedOfflineBreakdown, stopLoadedAlertOfflineBreakdown),
    unknown: iconSet(stopUnknown, stopUnknownAlert, stopUnknownBreakdown, stopUnknownOffline, stopUnknownAlertBreakdown, stopUnknownAlertOffline, stopUnknownOfflineBreakdown, stopUnknownAlertOfflineBreakdown),
  },
} as const

// Normalisasi nilai `status` dari backend ke key ICONS (running | idle | stop).
// Backend mengirim status dalam berbagai format (RUNNING/MOVING, IDLE,
// STOP/STOPPED/OFFLINE), sedangkan ICONS memakai key lowercase.
const STATUS_TO_ICON_KEY: Record<string, 'running' | 'idle' | 'stop'> = {
  RUNNING: 'running',
  MOVING: 'running',
  IDLE: 'idle',
  STOP: 'stop',
  STOPPED: 'stop',
  OFFLINE: 'stop',
}

export const getMarkerIcon = (equipment: EquipmentMarkerData, size = 32) => {
  const rawStatus = equipment.status.toUpperCase()
  const status = STATUS_TO_ICON_KEY[rawStatus] ?? 'idle'
  // console.log('status nya tracking', rawStatus, '→', status)
  const vessel = equipment.vessel_status.toUpperCase() === 'LOADED'
    ? 'loaded'
    : equipment.vessel_status.toUpperCase() === 'EMPTY' ? 'empty' : 'unknown'
  const isAlert = equipment.alert_count > 0
  const isOffline = equipment.gsm_signal === 0
  const isBreakdown = equipment.breakdown
  const icons = ICONS[status][vessel]
  const variant = isAlert && isOffline && isBreakdown ? 'alertOfflineBreakdown'
    : isAlert && isOffline ? 'alertOffline'
      : isAlert && isBreakdown ? 'alertBreakdown'
        : isOffline && isBreakdown ? 'offlineBreakdown'
          : isAlert ? 'alert' : isOffline ? 'offline' : isBreakdown ? 'breakdown' : 'normal'

  return createLeafletIcon(icons[variant], size)
}
