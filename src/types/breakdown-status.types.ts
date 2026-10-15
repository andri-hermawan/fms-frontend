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

export type BreakdownStatusCreatePayload = BreakdownStatusFormValues

export type BreakdownStatusUpdatePayload = Partial<BreakdownStatusFormValues>

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
export interface BreakdownStatusDailyParams {
  start_date: string
  end_date: string
  shift?: string[]
  equipment_code?: string[]
  max_days?: number
}

export interface BreakdownStatusDailyRow {
  equipment_code: string
  /** key: tanggal (YYYY-MM-DD), value: total durasi breakdown (jam) */
  values: Record<string, number>
}

export interface BreakdownStatusDaily {
  period: { start_date: string; end_date: string; total_days: number }
  days: string[]
  filters: { shift: string[] | null; equipment_code: string[] | null }
  data: BreakdownStatusDailyRow[]
  total_row: number
}
