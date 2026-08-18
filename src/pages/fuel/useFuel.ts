import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import fuelApi from '@/services/api/fuel.api'
import type { FuelFormValues } from '@/types/fuel.types'
import type { PaginationParams } from '@/types/api.types'

export const FUEL_KEY = 'fuel'

export const useFuels = (params?: PaginationParams) =>
  useQuery({
    queryKey: [FUEL_KEY, params],
    queryFn: () => fuelApi.getAll(params).then((r) => r.data),
  })

export const useCreateFuel = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: FuelFormValues) =>
      fuelApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FUEL_KEY] })
      message.success('Data fuel berhasil ditambahkan')
    },
    onError: () => message.error('Gagal menambahkan data fuel'),
  })
}

export const useUpdateFuel = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FuelFormValues> }) =>
      fuelApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FUEL_KEY] })
      message.success('Data fuel berhasil diperbarui')
    },
    onError: () => message.error('Gagal memperbarui data fuel'),
  })
}

export const useDeleteFuel = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      fuelApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FUEL_KEY] })
      message.success('Data fuel berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus data fuel'),
  })
}