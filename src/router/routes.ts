export const ROUTES = {
  // Auth
  LOGIN: '/login',

  // Dashboard
  DASHBOARD: '/',

  // Master
  USER: '/master/user',
  COMPANY: '/master/company',
  PROJECT: '/master/project',
  EQUIPMENT: '/master/equipment',
  DEVICE: '/master/device',
  SHIFT: '/master/shift',
  ALERT_CATEGORY: '/master/alert-category',

  // Operations
  TRACKING: '/tracking',
  ALERT: '/alert',
  FUEL: '/fuel',
  GEOFENCE: '/geofence',

  // Report
  REPORT: '/report',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
