import type { Dayjs } from 'dayjs'

export interface BreakdownStatus {
  id: string
  date_at: string
  shift: string
  equipment_code: string
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
  status: string
  category: string
  time_start?: string | null
  time_end?: string | null
  duration?: string | null
  repair_status: string
  description?: string | null
  location?: string | null
}

/**
 * Nilai form (belum dikonversi) — DatePicker/TimePicker menyimpan Dayjs.
 * Dipakai untuk `Form.useForm` / `setFieldsValue` / `validateFields`.
 */
export interface BreakdownFormValues {
  date_at: Dayjs
  shift: string
  equipment_code: string
  status: string
  category: string
  time_start?: Dayjs | null
  time_end?: Dayjs | null
  duration?: string | null
  repair_status: string
  description?: string | null
  location?: string | null
}