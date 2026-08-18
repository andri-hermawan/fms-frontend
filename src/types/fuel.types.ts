export interface FuelEquipments {
  equipment_code: string | null
}

export interface Fuel {
  id: string
  equipment_id: string
  log_id: string
  fuel_level: number | null
  fuel_volume: number | null
  fuel_temperature: number | null
  description: string | null
  is_inside: boolean | null
  orig_fid: number | null
  location_category: string | null
  segment: string | null
  speed: number | null
  vessel: string | null
  mileage: number | null
  vessel_status: string | null
  engine_status: boolean | null
  status: string | null
  shift: string | null
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
  fuel_difference: number | null
  fuel_percentage: number | null
  event_type: string | null
  equipments?: FuelEquipments | null
}

export interface FuelFormValues {
  equipment_id?: string
  fuel_level?: number | null
  fuel_volume?: number | null
  fuel_temperature?: number | null
  description?: string | null
  is_inside?: boolean | null
  location_category?: string | null
  segment?: string | null
  speed?: number | null
  vessel_status?: string | null
  engine_status?: boolean | null
  status?: string | null
  shift?: string | null
  event_type?: string | null
}