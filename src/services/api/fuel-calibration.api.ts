import { axiosInstance } from '@/services/http'

import type {
  FuelCalibration,
  FuelCalibrationFormValues,
} from '@/types/fuel-calibration.types'

import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api.types'

const fuelCalibrationApi = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<
      PaginatedResponse<FuelCalibration>
    >('/fms/api/fuel-calibrations', {
      params,
    }),

  getGroupByEquipment: (params?: PaginationParams) =>
    axiosInstance.get<
        PaginatedResponse<FuelCalibration>
    >('/fms/api/fuel-calibrations/group-by-equipment', {
        params,
    }),

  getById: (id: string) =>
    axiosInstance.get<
      ApiResponse<FuelCalibration>
    >(`/fms/api/fuel-calibrations/${id}`),

  create: (
    payload: FuelCalibrationFormValues,
  ) =>
    axiosInstance.post<
      ApiResponse<FuelCalibration>
    >('/fms/api/fuel-calibrations', payload),

  update: (
    id: string,
    payload: Partial<FuelCalibrationFormValues>,
  ) =>
    axiosInstance.put<
      ApiResponse<FuelCalibration>
    >(
      `/fms/api/fuel-calibrations/${id}`,
      payload,
    ),

  updateByEquipment: (
    equipmentId: string,
    payload: Partial<FuelCalibrationFormValues>,
  ) =>
    axiosInstance.put<
      ApiResponse<FuelCalibration>
    >(
      `/fms/api/fuel-calibrations/equipment/${equipmentId}`,
      payload,
    ),

  delete: (id: string) =>
    axiosInstance.delete<
      ApiResponse<null>
    >(`/fms/api/fuel-calibrations/${id}`),

  deleteByEquipment: (equipmentId: string) =>
    axiosInstance.delete<
      ApiResponse<null>
    >(`/fms/api/fuel-calibrations/equipment/${equipmentId}`),
}

export default fuelCalibrationApi