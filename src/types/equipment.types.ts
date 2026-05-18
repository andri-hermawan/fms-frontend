export type EquipmentStatus = 'active' | 'inactive'
export type EquipmentType = 'Dump Truck' | 'LV' 
export type EquipmentBrand = 'Hino' | 'Renault' | 'Mitsubishi' | 'Isuzu' | 'Fuso' | 'Volvo' | 'Scania'

export interface Equipment {
  id: string
  equipment_code: string
  equipment_alias: string
  type: EquipmentType
  brand: EquipmentBrand
  model: string
  class: string
  status: EquipmentStatus
  project_id: string
  project?: {
    project_name?: string
    project_code?: string
  }
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

export interface EquipmentFormValues {
  equipment_code: string
  equipment_alias: string
  type: EquipmentType
  brand: string
  model: string
  class: string
  status: EquipmentStatus
  project_id: string | null
}