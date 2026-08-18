export interface BreakdownStatus {
  id: string
  date_at: string
  shift: string
  equipment_code: string
  class: string
  status: string
  category: string
  time_start: string | null
  time_end: string | null
  duration: string | null
  repair_status: string
  description: string | null
  location: string | null
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

export interface BreakdownStatusFormValues {
  date_at: string
  shift: string
  equipment_code: string
  class: string
  status: string
  category: string
  time_start?: string | null
  time_end?: string | null
  duration?: string | null
  repair_status: string
  description?: string | null
  location?: string | null
}