import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import companyApi from '@/services/api/company.api'
import type { CompanyFormValues } from '@/types/company.types'
import type { PaginationParams } from '@/types/api.types'

export const COMPANY_KEY = 'companies'

export const useCompanies = (params?: PaginationParams) =>
  useQuery({
    queryKey: [COMPANY_KEY, params],
    queryFn: () => companyApi.getAll(params).then((r) => r.data),
  })

export const useCreateCompany = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: CompanyFormValues) =>
      companyApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [COMPANY_KEY] })
      message.success('Company berhasil ditambahkan')
    },
    onError: () => message.error('Gagal menambahkan company'),
  })
}

export const useUpdateCompany = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CompanyFormValues> }) =>
      companyApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [COMPANY_KEY] })
      message.success('Company berhasil diperbarui')
    },
    onError: () => message.error('Gagal memperbarui company'),
  })
}

export const useDeleteCompany = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      companyApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [COMPANY_KEY] })
      message.success('Company berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus company'),
  })
}
