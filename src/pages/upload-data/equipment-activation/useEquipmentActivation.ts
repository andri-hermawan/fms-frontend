import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import type { AxiosError } from 'axios'
import equipmentActivationApi from '@/services/api/equipment-activation.api'
import type {
  EquipmentActivationCreatePayload,
  EquipmentActivationUpdatePayload,
} from '@/types/equipment-activation.types'
import type { ApiError, PaginationParams } from '@/types/api.types'

export const EQUIPMENT_ACTIVATION_KEY = 'equipment-activation'

const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as AxiosError<ApiError>)?.response?.data?.message
  return Array.isArray(message) ? message.join(', ') : message || fallback
}

export const useEquipmentActivations = (params?: PaginationParams) =>
  useQuery({
    queryKey: [EQUIPMENT_ACTIVATION_KEY, params],
    queryFn: () => equipmentActivationApi.getAll(params).then((response) => response.data),
  })

export const useCreateEquipmentActivation = () => {
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: EquipmentActivationCreatePayload) =>
      equipmentActivationApi.create(payload).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_ACTIVATION_KEY] })
      message.success('Data equipment activation berhasil ditambahkan')
    },
    onError: (error) =>
      message.error(errorMessage(error, 'Gagal menambahkan data equipment activation')),
  })
}

export const useUpdateEquipmentActivation = () => {
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EquipmentActivationUpdatePayload }) =>
      equipmentActivationApi.update(id, payload).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_ACTIVATION_KEY] })
      message.success('Data equipment activation berhasil diperbarui')
    },
    onError: (error) =>
      message.error(errorMessage(error, 'Gagal memperbarui data equipment activation')),
  })
}

export const useDeleteEquipmentActivation = () => {
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      equipmentActivationApi.delete(id).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_ACTIVATION_KEY] })
      message.success('Data equipment activation berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus data equipment activation'),
  })
}

export const useImportEquipmentActivation = () => {
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ file, createdBy }: { file: File; createdBy: string }) =>
      equipmentActivationApi.importExcel(file, createdBy).then((response) => response.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_ACTIVATION_KEY] })
      message.success(`Import berhasil: ${data?.data?.imported ?? 0} baris`)
    },
    onError: () => message.error('Gagal mengimport file excel'),
  })
}
