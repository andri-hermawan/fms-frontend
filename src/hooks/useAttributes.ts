import { useQuery } from '@tanstack/react-query'

import attributeApi from '@/services/api/attribute.api'
import type { PaginationParams } from '@/types/api.types'

export const ATTRIBUTE_KEY = 'attributes'

export const useAttributes = (params?: PaginationParams) =>
  useQuery({
    queryKey: [ATTRIBUTE_KEY, params],
    queryFn: () => attributeApi.getAll(params).then((response) => response.data),
  })