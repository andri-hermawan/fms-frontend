import { axiosInstance } from '@/services/http'

import type {
  PassingResponse,
  PassingSummaryItem,
  PassingQuery,
} from '@/types/geofence.types'

interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

const geofenceApi = {
  getPassing: (params: PassingQuery) =>
    axiosInstance.get<PassingResponse>(
      '/fms/api/geofences/passing',
      {
        params,
      },
    ),

  getPassingSummary: (
    params: PassingQuery,
  ) =>
    axiosInstance.get<
      ApiResponse<PassingSummaryItem[]>
    >(
      '/fms/api/geofences/passing_summary',
      {
        params,
      },
    ),
}

export default geofenceApi