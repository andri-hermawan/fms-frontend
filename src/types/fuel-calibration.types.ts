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

// LLS = nilai mentah sensor LLS, PERCENTAGE = persen 0-100 (mis. dari ECU)
export type CalibrationType = 'LLS' | 'PERCENTAGE'

export interface FuelCalibration {
  id: string
  equipment_id: string
  equipment_code: string
  fuel_volume: number
  fuel_level: number
  calibration_type?: CalibrationType
}

export interface FuelCalibrationFormValues {
  equipment_id: string
  equipment_code?: string
  fuel_volume?: number | null
  fuel_level?: number | null
  calibration_type?: CalibrationType
}