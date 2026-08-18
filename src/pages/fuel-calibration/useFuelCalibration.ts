import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import fuelCalibrationApi from '@/services/api/fuel-calibration.api'
import type { FuelCalibrationFormValues } from '@/types/fuel-calibration.types'
import type { PaginationParams } from '@/types/api.types'

export const FUEL_CALIBRATION_KEY = 'fuel-calibrations'

export const useFuelCalibrations = (params?: PaginationParams) =>
  useQuery({
    queryKey: [FUEL_CALIBRATION_KEY, params],
    queryFn: () =>
      fuelCalibrationApi
        .getGroupByEquipment(params)
        .then((r) => {
          console.log('[useFuelCalibrations] params:', params)
          console.log('[useFuelCalibrations] response status:', r.status)
          console.log('[useFuelCalibrations] response data:', r.data)
          return r.data
        }),
  })

export const useCreateFuelCalibration = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: FuelCalibrationFormValues) =>
      fuelCalibrationApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FUEL_CALIBRATION_KEY] })
      message.success('Fuel calibration berhasil ditambahkan')
    },
    onError: () => message.error('Gagal menambahkan fuel calibration'),
  })
}

export const useUpdateFuelCalibration = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ equipmentId, payload }: { equipmentId: string; payload: Partial<FuelCalibrationFormValues> }) =>
      fuelCalibrationApi.updateByEquipment(equipmentId, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FUEL_CALIBRATION_KEY] })
      message.success('Fuel calibration berhasil diperbarui')
    },
    onError: () => message.error('Gagal memperbarui fuel calibration'),
  })
}

export const useDeleteFuelCalibration = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (equipmentId: string) =>
      fuelCalibrationApi.deleteByEquipment(equipmentId).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FUEL_CALIBRATION_KEY] })
      message.success('Fuel calibration berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus fuel calibration'),
  })
}