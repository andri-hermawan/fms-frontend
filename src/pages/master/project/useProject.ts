import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import projectApi from '@/services/api/project.api'
import type { ProjectFormValues } from '@/types/project.types'
import type { PaginationParams } from '@/types/api.types'

export const PROJECT_KEY = 'projects'

export const useProjects = (params?: PaginationParams) =>
  useQuery({
    queryKey: [PROJECT_KEY, params],
    queryFn: () => projectApi.getAll(params).then((r) => r.data),
  })

export const useCreateProject = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (payload: ProjectFormValues) =>
      projectApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROJECT_KEY] })
      message.success('Project berhasil ditambahkan')
    },
    onError: () => message.error('Gagal menambahkan project'),
  })
}

export const useUpdateProject = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProjectFormValues> }) =>
      projectApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROJECT_KEY] })
      message.success('Project berhasil diperbarui')
    },
    onError: () => message.error('Gagal memperbarui project'),
  })
}

export const useDeleteProject = () => {
  const qc = useQueryClient()
  const { message } = App.useApp()
  return useMutation({
    mutationFn: (id: string) =>
      projectApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROJECT_KEY] })
      message.success('Project berhasil dihapus')
    },
    onError: () => message.error('Gagal menghapus project'),
  })
}
