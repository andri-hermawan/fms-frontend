export type ReportScheduleStatus = 'active' | 'inactive'

export interface ReportScheduleRecipient {
  id: string
  name: string | null
  email: string
}

export interface ReportSchedule {
  id: string
  name: string
  report_type: string
  shift: string
  date_offset: number
  send_time: string
  timezone: string
  user_ids: string[]
  recipients: ReportScheduleRecipient[]
  status: ReportScheduleStatus | null
  last_run_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ReportScheduleFormValues {
  name: string
  report_type: string
  shift: string
  date_offset: number
  send_time: string
  user_ids: string[]
  status: ReportScheduleStatus
}

export type ReportSchedulePayload = ReportScheduleFormValues

export interface ReportScheduleQueryParams {
  page?: number
  limit?: number
  status?: string
}

export interface ReportType {
  value: string
  label: string
}

export interface ReportScheduleLog {
  id: string
  run_date: string
  report_date: string
  trigger: 'schedule' | 'manual'
  status: 'success' | 'failed'
  recipients: number
  error_message: string | null
  created_at: string
}
