export type ShiftStatus = 'active' | 'inactive'

export interface Shift {
  id: string
  shift_code: string
  shift_name: string
  status: ShiftStatus
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

export interface ShiftFormValues {
  shift_code: string
  shift_name: string
  status: ShiftStatus
}