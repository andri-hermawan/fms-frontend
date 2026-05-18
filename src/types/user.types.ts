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
  password_hash: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface UserFormValues {
  project_id: string
  name: string
  email: string
  password_hash: string
  role: UserRole
  status: UserStatus
}
