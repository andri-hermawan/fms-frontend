// import type { Equipment } from './equipment.types'

// export interface FuelCalibration {
//   id: string
//   equipment_id: string
//   equipment?: Equipment
//   calibration_value: number
//   calibration_type: string
//   status: 'active' | 'inactive'
//   created_at: string
//   created_by: string | null
//   updated_at: string | null
//   updated_by: string | null
// }

export interface FuelCalibration {
  id: string
  equipment_id: string
  equipment_code: string
  fuel_volume: number
  fuel_level: number
}

export interface FuelCalibrationFormValues {
  equipment_id: string
  equipment_code?: string
  fuel_volume?: number | null
  fuel_level?: number | null
}