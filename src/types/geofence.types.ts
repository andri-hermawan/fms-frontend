export type GeofenceType = 'allowed' | 'restricted'
export type GeofenceShape = 'polygon' | 'circle'
export type GeofenceStatus = 'active' | 'inactive'

export interface Geofence {
  id: string
  name: string
  type: GeofenceType
  shape: GeofenceShape
  status: GeofenceStatus
  geoJson: GeoJSON.Feature
  color: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface GeofenceFormValues {
  name: string
  type: GeofenceType
  status: GeofenceStatus
  description?: string
}

export interface VehicleGeofenceStatus {
  vehicleId: string
  vehicleName: string
  geofenceId: string
  geofenceName: string
  isInside: boolean
  lastChecked: string
}
