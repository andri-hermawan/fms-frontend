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
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
