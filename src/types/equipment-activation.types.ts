export interface EquipmentActivation {
  id: string
  date_at: string
  equipment_code: string
  status: 'Active' | 'Non Active'
  description: string | null
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

export interface EquipmentActivationFormValues {
  date_at: string
  equipment_code: string
  status: 'Active' | 'Non Active'
  description?: string | null
}

export type EquipmentActivationCreatePayload = EquipmentActivationFormValues

export type EquipmentActivationUpdatePayload = Partial<EquipmentActivationFormValues>
