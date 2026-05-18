export type AlertCategoryStatus = 'active' | 'inactive'

export interface AlertCategory {
  id: string
  alert_category_code: string
  alert_category_name: string
  status: AlertCategoryStatus
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

export interface AlertCategoryFormValues {
  alert_category_code: string
  alert_category_name: string
  status: AlertCategoryStatus
}