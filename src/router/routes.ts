export const ROUTES = {
  // Auth
  LOGIN: '/login',

  // Dashboard
  DASHBOARD: '/',
  TRACKING: '/tracking',
  GEOFENCE: '/geofence',
  GRAPHIC: '/graphic',
  DISTRIBUTION_MAP: '/distribution-maps',
  POSITION_HISTORY: '/position-history',
  FUEL: '/fuel',
  FUEL_HISTORY: '/fuel-history',
  SPEED_PER_SEGMENT: '/speed-per-segment',

  // Master
  USER: '/master/user',
  COMPANY: '/master/company',
  PROJECT: '/master/project',
  EQUIPMENT: '/master/equipment',
  DEVICE: '/master/device',
  SHIFT: '/master/shift',
  ALERT_CATEGORY: '/master/alert-category',
  ALERT_RULE: '/master/alert-rule',
  FUEL_CALIBRATION: '/fuel-calibration',

  // Alerts
  ALERT: '/alert',
  UNDERSPEED: '/underspeed',
  OVERSPEED: '/overspeed',
  OFFTRACK: '/offtrack',
  FUELALERT: '/fuel-alert',
  
  // Upload
  DAILY_SETTING_OPERATOR: '/upload/daily-setting-operator',
  STATUS_BREAKDOWN: '/upload/status-breakdown',
  WEIGHBRIDGE: '/upload/weighbridge',

  // Report
  REPORT: '/report',
  REPORT_EQUIPMENT_LOGS: '/report/report-equipment-logs',
  REPORT_FUEL_HISTORY: '/report/report-fuel-history',
  REPORT_ALERT_HISTORY: '/alert',
  REPORT_ALERT_SUMMARY: '/report/report-alert-summary',
  PLAYBACK_UNIT_HISTORY: '/report/playback-unit-history',
  EQUIPMENT_SHIFT_PERFORMANCE: '/report/equipment-shift-performance',
  PHYSICAL_AVAILABILITY: '/report/physical-availability',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
