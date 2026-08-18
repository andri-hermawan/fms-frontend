export interface DailySettingOperator {
  id: string
  date_at: string
  shift: string
  equipment_code: string
  operator_name: string
  description: string | null
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

export interface DailySettingOperatorFormValues {
  date_at: string
  shift: string
  equipment_code: string
  operator_name: string
  description?: string | null
}