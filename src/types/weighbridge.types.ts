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