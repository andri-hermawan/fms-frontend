export type UserStatus = 'active' | 'inactive'
export type UserRole = 'superadmin' | 'admin' | 'viewer'

export interface User {
  id: string
  project_id: string
  project?: {
    project_name?: string
    project_code?: string
  }
  name: string
  email: string
  phone_number?: string | null
  password_hash: string
  role: UserRole
  status: UserStatus
  created_at: string
  created_by?: string | null
  updated_at?: string | null
  updated_by?: string | null
}

export interface UserFormValues {
  project_id: string
  name: string
  email: string
  phone_number?: string
  password_hash: string
  role: UserRole
  status: UserStatus
}
