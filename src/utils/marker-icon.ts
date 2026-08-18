import createLeafletIcon from './createLeafletIcon'

import runningEmpty from '@/assets/markers/running_empty.png'
import runningEmptyAlert from '@/assets/markers/running_empty_alert.png'
import runningLoad from '@/assets/markers/running_load.png'
import runningLoadAlert from '@/assets/markers/running_load_alert.png'
import runningLocation from '@/assets/markers/running_location.png'
import runningLocationAlert from '@/assets/markers/running_location_alert.png'

import idleEmpty from '@/assets/markers/idle_empty.png'
import idleEmptyAlert from '@/assets/markers/idle_empty_alert.png'
import idleLoad from '@/assets/markers/idle_load.png'
import idleLoadAlert from '@/assets/markers/idle_load_alert.png'
import idleLocation from '@/assets/markers/idle_location.png'
import idleLocationAlert from '@/assets/markers/idle_location_alert.png'

import offlineEmpty from '@/assets/markers/offline_empty.png'
import offlineEmptyAlert from '@/assets/markers/offline_empty_alert.png'
import offlineLoad from '@/assets/markers/offline_load.png'
import offlineLoadAlert from '@/assets/markers/offline_load_alert.png'
import offlineLocation from '@/assets/markers/offline_location.png'
import offlineLocationAlert from '@/assets/markers/offline_location_alert.png'

import stopEmpty from '@/assets/markers/stop_empty.png'
import stopEmptyAlert from '@/assets/markers/stop_empty_alert.png'
import stopLoad from '@/assets/markers/stop_load.png'
import stopLoadAlert from '@/assets/markers/stop_load_alert.png'
import stopLocation from '@/assets/markers/stop_location.png'
import stopLocationAlert from '@/assets/markers/stop_location_alert.png'

import type { EquipmentMarkerData } from '@/types/map.types'

const ICONS = {
  running: {
    empty: {
      normal: runningEmpty,
      alert: runningEmptyAlert,
    },
    load: {
      normal: runningLoad,
      alert: runningLoadAlert,
    },
    location: {
      normal: runningLocation,
      alert: runningLocationAlert,
    },
  },

  idle: {
    empty: {
      normal: idleEmpty,
      alert: idleEmptyAlert,
    },
    load: {
      normal: idleLoad,
      alert: idleLoadAlert,
    },
    location: {
      normal: idleLocation,
      alert: idleLocationAlert,
    },
  },

  offline: {
    empty: {
      normal: offlineEmpty,
      alert: offlineEmptyAlert,
    },
    load: {
      normal: offlineLoad,
      alert: offlineLoadAlert,
    },
    location: {
      normal: offlineLocation,
      alert: offlineLocationAlert,
    },
  },

  stop: {
    empty: {
      normal: stopEmpty,
      alert: stopEmptyAlert,
    },
    load: {
      normal: stopLoad,
      alert: stopLoadAlert,
    },
    location: {
      normal: stopLocation,
      alert: stopLocationAlert,
    },
  },
}

export const getMarkerIcon = (
  equipment: EquipmentMarkerData,
) => {
  const status =
  equipment.status === 'RUNNING'
    ? 'running'
    : equipment.status === 'OFFLINE'
      ? 'offline'
      : equipment.status === 'STOP'
        ? 'stop'
        : 'idle';

  const vessel =
    equipment.vessel_status?.toUpperCase() === 'LOADED'
      ? 'load'
      : equipment.vessel_status?.toUpperCase() === 'EMPTY'
        ? 'empty'
        : 'location'

  const alert =
    equipment.alert_count > 0
      ? 'alert'
      : 'normal'

  const url =
    ICONS[status][vessel][alert]

  return createLeafletIcon(url)
}