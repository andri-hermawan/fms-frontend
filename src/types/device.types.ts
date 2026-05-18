export type DeviceStatus = 'active' | 'inactive'

export interface Device {
  id: string
  device_code: string
  device_name: string
  provider_name: string
  sim_number: string
  device_model: string
  equipment_id: string
  equipments?: {
    equipment_code?: string
    equipment_alias?: string
    type?: string
    brand?: string
    model?: string
    class?: string
  }
  status: DeviceStatus
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

export interface DeviceFormValues {
  device_code: string
  device_name: string
  provider_name: string
  sim_number: string
  device_model: string
  equipment_id: string
  status: DeviceStatus
}