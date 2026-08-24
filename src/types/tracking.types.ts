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

export interface ActivitySummaryParams {
  equipment_id: string
  start_date: string
  end_date: string
  shift?: string
}

export interface ActivitySummaryData {
  equipment_id: string
  equipment_code: string
  period: {
    start: string
    end: string
  }
  summary: {
    running_time: number // jam
    running_empty: number // jam
    running_loaded: number // jam
    idling_time: number // jam
    idling_empty: number // jam
    idling_loaded: number // jam
    mileage: number // km
    avg_running_speed: number // km/h
    avg_running_speed_empty: number // km/h
    avg_running_speed_loaded: number // km/h
    max_running_speed: number // km/h
    max_running_speed_empty: number // km/h
    max_running_speed_loaded: number // km/h
    fuel_start_run: number // liter
    fuel_remaining: number // liter
    fuel_increase: number // liter
    fuel_decrease: number // liter
    fuel_burn_ratio: number // liter/hour
  }
}

export interface StopPoint {
  latitude: number
  longitude: number
  startTime: string
  endTime: string
  durationMinutes: number
  address?: string
}
