import { axiosInstance } from '@/services/http'

import type { Fuel, FuelFormValues } from '@/types/fuel.types'

import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api.types'

const fuelApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<
      PaginatedResponse<Fuel>
    >('/fms/api/fuels', {
      params,
    }),

  getById: (id: string) =>
    axiosInstance.get<
      ApiResponse<Fuel>
    >(`/fms/api/fuels/${id}`),

  create: (
    payload: FuelFormValues,
  ) =>
    axiosInstance.post<
      ApiResponse<Fuel>
    >('/fms/api/fuels', payload),

  update: (
    id: string,
    payload: Partial<FuelFormValues>,
  ) =>
    axiosInstance.put<
      ApiResponse<Fuel>
    >( `/fms/api/fuels/${id}`, payload),

  delete: (id: string) =>
    axiosInstance.delete<
      ApiResponse<null>
    >(`/fms/api/fuels/${id}`),
}

export default fuelApi