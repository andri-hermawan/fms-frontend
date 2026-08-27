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
  project_id?: string
  start_time?: string
  end_time?: string
  sequence?: number
  timezone?: string
}

export interface ShiftFormValues {
  shift_code: string
  shift_name: string
  status: ShiftStatus
}

export interface CurrentShift {
  project_id: string
  checked_time: string
  shift: Shift & {
    project_id: string
    start_time: string
    end_time: string
    sequence: number
    timezone: string
  }
}