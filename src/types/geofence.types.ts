export type EventGeofence = 'IN' | 'OUT'

export interface PassingItem {
  id: number
  equipment_code: string
  segment: string
  time: string
  event: EventGeofence
}

export interface PassingSummaryItem {
  hour: string
  in: number
  out: number
  total: number
}

export interface PassingResponse {
  data: PassingItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface PassingQuery {
  page?: number
  limit?: number
  equipment_code?: string
  segment?: string
  start_date?: string
  end_date?: string
}