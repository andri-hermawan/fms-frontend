export interface Weighbridge {
  id: string
  date_at: string
  shift: string
  ticket_no: string
  equipment_code: string
  product: string
  gross: number
  tare: number
  net: number
  recipient: string
  customer: string
  transporter: string
  gross_time: string | null
  tare_time: string | null
  gross_operator: string
  tare_operator: string
  description: string | null
  location: string | null
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

export interface WeighbridgeRitaseDailyParams {
  start_date: string
  end_date: string
  shift?: string[]
  equipment_code?: string[]
  max_days?: number
}

export interface WeighbridgeRitaseDailyRow {
  equipment_code: string
  ritase: number
  total_net: number
  /** key: tanggal (YYYY-MM-DD), value: jumlah ritase */
  values: Record<string, number>
}

export interface WeighbridgeRitaseDaily {
  period: { start_date: string; end_date: string; total_days: number }
  days: string[]
  filters: { shift: string[] | null; equipment_code: string[] | null }
  data: WeighbridgeRitaseDailyRow[]
  total_row: number
}

export type WeighbridgePayloadDailyParams = WeighbridgeRitaseDailyParams

export interface WeighbridgePayloadDailyRow {
  equipment_code: string
  /** key: tanggal (YYYY-MM-DD), value: rata-rata payload (ton) */
  values: Record<string, number>
}

export interface WeighbridgePayloadDaily {
  period: { start_date: string; end_date: string; total_days: number }
  days: string[]
  filters: { shift: string[] | null; equipment_code: string[] | null }
  data: WeighbridgePayloadDailyRow[]
  total_row: number
}

export type WeighbridgeProductionDailyParams = WeighbridgeRitaseDailyParams

export interface WeighbridgeProductionDailyRow {
  equipment_code: string
  /** key: tanggal (YYYY-MM-DD), value: total produksi (ton) */
  values: Record<string, number>
}

export interface WeighbridgeProductionDaily {
  period: { start_date: string; end_date: string; total_days: number }
  days: string[]
  filters: { shift: string[] | null; equipment_code: string[] | null }
  data: WeighbridgeProductionDailyRow[]
  total_row: number
}

export interface WeighbridgeFormValues {
  date_at: string
  shift: string
  ticket_no: string
  equipment_code: string
  product: string
  gross: number
  tare: number
  net: number
  recipient: string
  customer: string
  transporter: string
  gross_time?: string | null
  tare_time?: string | null
  gross_operator: string
  tare_operator: string
  description?: string | null
  location?: string | null
}