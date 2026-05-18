import type { Company } from './company.types'
import type { FeatureCollection, Feature, Geometry } from 'geojson'

export type ProjectStatus = 'active' | 'inactive'

export interface Project {
  id: string
  project_code: string
  project_name: string
  image: string | null
  geojson_origin: string | FeatureCollection | Feature | Geometry | null
  geom_origin: unknown
  status: ProjectStatus
  company_id: string
  companies: Company
  created_at: string
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

export interface ProjectFormValues {
  project_code: string
  project_name: string
  status: ProjectStatus
  company_id: string
  geojson_origin?: string | FeatureCollection | Feature | Geometry | null
  image?: string | null
}