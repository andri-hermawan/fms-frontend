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
  SPEED_PER_SEGMENT: '/speed-per-segment',

  // Master
  USER: '/master/user',
  COMPANY: '/master/company',
  PROJECT: '/master/project',
  EQUIPMENT: '/master/equipment',
  DEVICE: '/master/device',
  SHIFT: '/master/shift',
  ALERT_CATEGORY: '/master/alert-category',
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
  REPORT_A: '/report/a',
  REPORT_B: '/report/b',
  REPORT_C: '/report/c',
  REPORT_D: '/report/d',
  REPORT_E: '/report/e',
  REPORT_F: '/report/f',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
