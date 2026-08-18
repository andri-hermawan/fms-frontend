import type { ReactNode } from 'react'
import type { GeoJsonObject } from 'geojson'

export interface EquipmentMarkerData {
  equipment_id: string
  equipment_code: string
  latitude: number
  longitude: number
  heading: number
  speed: number
  vessel_status: string
  status: string
  engine_status: boolean
  alert_count: number
  fuel_level: number
  fuel_volume: number
  fuel_percentage: number
  recorded_at: string
}

export interface BaseMapProps {
  children?: ReactNode
  center?: [number, number]
  zoom?: number
  showToolbar?: boolean
  enableDraw?: boolean
}

export interface EquipmentMarkerProps {
  equipments: EquipmentMarkerData[]
  selectedEquipment?: string
  onSelectEquipment?: (
    equipmentId: string,
  ) => void
}

export interface MapLayersProps {
  geoJson?: GeoJsonObject | null
  equipments: EquipmentMarkerData[]
  selectedEquipment?: string
  onSelectEquipment?: (
    equipmentId: string,
  ) => void
}

export interface GeofenceLayerProps {
  geoJson?: GeoJsonObject | null
  segmentStats?: Record<string, { speed: string; status: string }>
}

export interface FitBoundsProps {
  equipments: EquipmentMarkerData[]
  geoJson?: GeoJsonObject | null
}

export interface MapToolbarProps {
  mode: 'street' | 'satellite'
  onChange: (
    mode: 'street' | 'satellite',
  ) => void
}

export interface MapControllerProps {
  latitude?: number
  longitude?: number
  zoom?: number
}

export interface DrawControlProps {
  editable?: boolean
  onCreate?: (
    geoJson: GeoJSON.GeoJSON,
  ) => void
  onEdit?: (
    geoJson: GeoJSON.GeoJSON,
  ) => void
  onDelete?: () => void
}

export interface EquipmentSearchProps {
  value?: string

  options: {
    label: string
    value: string
  }[]

  onChange?: (
    value?: string,
  ) => void
}

export interface SegmentSearchProps {
  value?: string

  options: {
    label: string
    value: string
  }[]

  onChange?: (
    value?: string,
  ) => void
}


export interface DrawControlProps {
  editable?: boolean

  onCreate?: (
    geoJson: GeoJSON.GeoJSON,
  ) => void

  onEdit?: (
    geoJson: GeoJSON.GeoJSON,
  ) => void

  onDelete?: () => void
}