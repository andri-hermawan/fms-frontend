import { axiosInstance } from '@/services/http'

import type {
  Project,
  ProjectFormValues,
} from '@/types/project.types'

import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api.types'

const projectApi = {
  getAll: (
    params?: PaginationParams,
  ) =>
    axiosInstance.get<
      PaginatedResponse<Project>
    >('/fms/api/projects', {
      params,
    }),

  getById: (id: string) =>
    axiosInstance.get<
      ApiResponse<Project>
    >(`/fms/api/projects/${id}`),

  create: (
    payload: ProjectFormValues,
  ) =>
    axiosInstance.post<
      ApiResponse<Project>
    >('/fms/api/projects', payload),

  update: (
    id: string,
    payload: Partial<ProjectFormValues>,
  ) =>
    axiosInstance.put<
      ApiResponse<Project>
    >(
      `/fms/api/projects/${id}`,
      payload,
    ),

  updateGeoJson: (
    id: string,
    geojson_origin: GeoJSON.GeoJSON,
  ) =>
    axiosInstance.patch<
      ApiResponse<Project>
    >(`/fms/api/projects/${id}`, {
      geojson_origin,
    }),

  delete: (id: string) =>
    axiosInstance.delete<
      ApiResponse<null>
    >(`/fms/api/projects/${id}`),
}

export default projectApi