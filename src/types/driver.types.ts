export type DriverStatus = 'active' | 'inactive' | 'on_duty'
export type LicenseClass = 'A' | 'B1' | 'B2' | 'C' | 'D'

export interface Driver {
  id: string
  name: string
  nik: string
  phone: string
  email: string | null
  licenseNumber: string
  licenseClass: LicenseClass
  licenseExpiry: string
  status: DriverStatus
  photoUrl: string | null
  emergencyContact: string | null
  createdAt: string
  updatedAt: string
}

export interface DriverFormValues {
  name: string
  nik: string
  phone: string
  email?: string
  licenseNumber: string
  licenseClass: LicenseClass
  licenseExpiry: string
  status: DriverStatus
  emergencyContact?: string
}
