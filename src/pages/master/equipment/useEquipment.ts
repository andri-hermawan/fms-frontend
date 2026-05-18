import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import equipmentApi from '@/services/api/equipment.api'
import type { PaginationParams } from '@/types/api.types'
import { EquipmentFormValues } from '@/types/equipment.types'

export const EQUIPMENT_KEY = 'equipments'

// ─── Queries ──────────────────────────────────────────────────

export const useEquipments = (params?: PaginationParams) =>
  useQuery({
    queryKey: [EQUIPMENT_KEY, params],
    queryFn: () => equipmentApi.getAll(params).then((r) => r.data),
  })

export const useEquipmentById = (id: string) =>
  useQuery({
    queryKey: [EQUIPMENT_KEY, id],
    queryFn: () => equipmentApi.getById(id).then((r) => r.data),
    enabled: !!id,
  })

// ─── Mutations ────────────────────────────────────────────────

export const useCreateEquipment = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()

  return useMutation({
    mutationFn: (payload: EquipmentFormValues) =>
      equipmentApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EQUIPMENT_KEY] })
      message.success('Perangkat berhasil ditambahkan')
    },
    onError: () => {
      message.error('Gagal menambahkan perangkat')
    },
  })
}

export const useUpdateEquipment = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EquipmentFormValues> }) =>
      equipmentApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EQUIPMENT_KEY] })
      message.success('Perangkat berhasil diperbarui')
    },
    onError: () => {
      message.error('Gagal memperbarui perangkat')
    },
  })
}

export const useDeleteEquipment = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()

  return useMutation({
    mutationFn: (id: string) =>
      equipmentApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EQUIPMENT_KEY] })
      message.success('Perangkat berhasil dihapus')
    },
    onError: () => {
      message.error('Gagal menghapus perangkat')
    },
  })
}
