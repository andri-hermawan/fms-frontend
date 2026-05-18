export type EngineStatus = 'on' | 'off'
export type MovementStatus = 'moving' | 'idle' | 'stopped'

export interface VehiclePosition {
  vehicleId: string
  licensePlate: string
  vehicleName: string
  driverName: string | null
  latitude: number
  longitude: number
  speed: number           // km/h
  heading: number         // 0-360 derajat
  altitude: number        // meter
  fuelLevel: number       // 0-100 persen
  engineStatus: EngineStatus
  movementStatus: MovementStatus
  gpsAccuracy: number     // meter
  timestamp: string
}

export interface GpsHistory {
  id: string
  vehicleId: string
  latitude: number
  longitude: number
  speed: number
  heading: number
  fuelLevel: number
  engineStatus: EngineStatus
  timestamp: string
}

export interface TrackingHistoryParams {
  vehicleId: string
  startDate: string
  endDate: string
}

export interface StopPoint {
  latitude: number
  longitude: number
  startTime: string
  endTime: string
  durationMinutes: number
  address?: string
}
