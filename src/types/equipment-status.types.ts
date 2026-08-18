export type MovementStatus = 'OFFLINE' | 'IDLE' | 'MOVING'

export interface EquipmentLiveStatus {
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
  segment: string
  speed: number           // km/h
  heading: number         // 0–360 derajat
  altitude?: number       // meter
  fuel_level: number // 0–100 persen
  fuel_temperature: number // derajat Celcius
  fuel_volume: number // liter
  fuel_percentage: number // 0–100 persen
  fuel_difference: number // liter
  alert_count: number
  vessel: number
  engine_status: boolean
  status: MovementStatus
  vessel_status: string   
  recorded_at: string     // ISO timestamp
  device_code?: string
}

export interface EquipmentStatusSummary {
  total: number
  moving: number
  idle: number
  stopped: number
}