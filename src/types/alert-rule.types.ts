export type AlertRuleStatus = 'active' | 'inactive'

export type AlertRuleScope = 'global' | 'project' | 'segment'

// Kolom threshold; null = mengikuti level di atasnya (default -> global -> project -> segment)
export type AlertRuleThresholdField = 'duration_minutes' | 'speed_limit' | 'fuel_threshold'

export interface AlertRule {
  id: string
  alert_category_id: string
  project_id: string | null
  segment: string | null
  // Kolom Decimal dikirim backend sebagai string
  duration_minutes: string | number | null
  speed_limit: string | number | null
  fuel_threshold: string | number | null
  description: string | null
  status: AlertRuleStatus
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
  alert_categories: {
    alert_category_code: string
    alert_category_name: string
  }
  projects: {
    project_code: string
    project_name: string
  } | null
}

export interface AlertRuleSegment {
  segment: string
  category: string | null
}

export interface AlertRuleFormValues {
  alert_category_id: string
  scope: AlertRuleScope
  project_id?: string | null
  segment?: string | null
  duration_minutes?: number | null
  speed_limit?: number | null
  fuel_threshold?: number | null
  description?: string
  status: AlertRuleStatus
}

export type AlertRulePayload = Omit<AlertRuleFormValues, 'scope'>

export interface AlertRuleQueryParams {
  page?: number
  limit?: number
  alert_category_id?: string
  project_id?: string
  status?: AlertRuleStatus
}
