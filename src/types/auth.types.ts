import type { FeatureCollection, Feature, Geometry } from 'geojson'
export type Role = 'superadmin' | 'admin' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}
 
// Project yang dikembalikan saat login
export interface LoginProject {
  id:string
  project_code: string
  project_name: string
  geojson_origin: FeatureCollection | Feature | Geometry | null
}

export interface LoginRequest {
  email: string
  password: string
}

// Sesuai response backend:
// { statusCode, message, data: { access_token, refresh_token, user } }
export interface LoginResponseData {
  access_token: string
  refresh_token: string
  user: User
  project: LoginProject | null
}

export interface RefreshResponseData {
  accessToken: string
  refreshToken?: string
}

// Permission matrix per role
export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'

export type Resource =
  | 'equipment'
  | 'company'
  | 'project'
  | 'device'
  | 'shift'
  | 'alert_category'
  | 'user'
  | 'tracking'
  | 'alert'
  | 'fuel'
  | 'geofence'
  | 'report'

export type PermissionMap = Record<Role, Record<Resource, Action[]>>

export const PERMISSION_MAP: PermissionMap = {
  superadmin: {
    equipment:  ['create', 'read', 'update', 'delete', 'export'],
    company:   ['create', 'read', 'update', 'delete', 'export'],
    project:  ['create', 'read', 'update', 'delete', 'export'],
    device:   ['create', 'read', 'update', 'delete', 'export'],
    shift:    ['create', 'read', 'update', 'delete', 'export'],
    alert_category: ['create', 'read', 'update', 'delete', 'export'],
    user:     ['create', 'read', 'update', 'delete', 'export'],
    tracking: ['create', 'read', 'update', 'delete', 'export'],
    alert:    ['create', 'read', 'update', 'delete', 'export'],
    fuel:     ['create', 'read', 'update', 'delete', 'export'],
    geofence: ['create', 'read', 'update', 'delete', 'export'],
    report:   ['create', 'read', 'update', 'delete', 'export'],
  },
  admin: {
    equipment:  ['create', 'read', 'update', 'delete', 'export'],
    company:   ['create', 'read', 'update', 'delete', 'export'],
    project:  ['create', 'read', 'update', 'delete', 'export'],
    device:   ['create', 'read', 'update', 'delete', 'export'],
    shift:    ['create', 'read', 'update', 'delete', 'export'],
    alert_category: ['create', 'read', 'update', 'delete', 'export'],
    user:     ['read'],
    tracking: ['read', 'export'],
    alert:    ['read', 'update', 'export'],
    fuel:     ['read', 'export'],
    geofence: ['create', 'read', 'update', 'delete'],
    report:   ['read', 'export'],
  },
  viewer: {
    equipment:  ['read'],
    company:   ['read'],
    project:  ['read'],
    device:   ['read'],
    shift:    ['read'],
    alert_category: ['read'],
    user:     [],
    tracking: ['read'],
    alert:    ['read'],
    fuel:     ['read'],
    geofence: ['read'],
    report:   ['read'],
  },
}