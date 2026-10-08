import type { AlertRuleThresholdField } from '@/types/alert-rule.types'

export const THRESHOLD_FIELDS: Record<AlertRuleThresholdField, { label: string; unit: string }> = {
  duration_minutes: { label: 'Duration', unit: 'menit' },
  speed_limit:      { label: 'Speed Limit', unit: 'km/h' },
  fuel_threshold:   { label: 'Fuel Threshold', unit: 'L' },
}

// Threshold yang dipakai detector per kode kategori (lihat backend alert-rule.constants.ts)
export const FIELDS_BY_CODE: Record<string, AlertRuleThresholdField[]> = {
  OFT: ['duration_minutes'],
  OVS: ['duration_minutes', 'speed_limit'],
  UVS: ['duration_minutes', 'speed_limit'],
  FUD: ['duration_minutes', 'fuel_threshold'],
  FUO: ['fuel_threshold'],
}

const ALL_FIELDS = Object.keys(THRESHOLD_FIELDS) as AlertRuleThresholdField[]

export const getThresholdFields = (code?: string): AlertRuleThresholdField[] =>
  (code && FIELDS_BY_CODE[code]) || ALL_FIELDS

export const SCOPE_OPTIONS = [
  { value: 'global',  label: 'Global' },
  { value: 'project', label: 'Project' },
  { value: 'segment', label: 'Segment' },
]

export const STATUS_OPTIONS = [
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]
