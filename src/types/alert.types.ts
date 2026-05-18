export type AlertType =
  | 'overspeed'
  | 'geofence_enter'
  | 'geofence_exit'
  | 'fuel_critical'
  | 'engine_off_abnormal'
  | 'idle_too_long'
  | 'harsh_braking'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'active' | 'resolved' | 'acknowledged'

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  vehicleId: string
  vehicleName: string
  licensePlate: string
  driverName: string | null
  message: string
  latitude: number | null
  longitude: number | null
  isRead: boolean
  triggeredAt: string
  resolvedAt: string | null
  metadata: Record<string, unknown>
}

export interface AlertRule {
  id: string
  name: string
  type: AlertType
  vehicleId: string | null    // null = berlaku untuk semua kendaraan
  isActive: boolean
  threshold: AlertThreshold
  notifyEmail: boolean
  notifyInApp: boolean
  createdAt: string
}

export interface AlertThreshold {
  maxSpeed?: number           // km/h untuk overspeed
  maxIdleMinutes?: number     // menit untuk idle too long
  minFuelPercent?: number     // % untuk fuel critical
  geofenceId?: string         // untuk geofence alert
}
