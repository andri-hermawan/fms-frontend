export interface EquipmentLog {
  id: string
  time: string
  equipment_id: string
  device_id: string
  is_inside: boolean
  orig_fid: number
  category_location: string
  segment: string
  speed: string
  fuel_level: string
  vessel: string
  mileage: string
  vessel_status: string
  engine_status: boolean
  status: string
  shift: string
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
  latitude: number
  longitude: number
  altitude: number
  heading: number
  satellites: number
  accelerometer_x: string
  accelerometer_y: string
  accelerometer_z: string
  odometer: string
  external_voltage: string
  internal_battery_voltage: string
  battery_current: string
  gsm_signal: number
  gsm_operator: number
  pdop: string
  hdop: string
  gnss_status: number
  fuel_temperature: string
  sleep_mode: number
  movement_runtime: number
  analog_input_1: string
  fuel_volume: string
  fuel_percentage: string
  fuel_difference: string
  equipment_code: string
  device_code: string
  alerts: Array<{
    status: string
  }>
}

export interface EquipmentLogParams {
  created_at: string
  equipment_code?: string
  shift: string
}

export interface SegmentSpeedSummary {
  segment: string
  avg_speed_empty: string
  avg_speed_loaded: string
}