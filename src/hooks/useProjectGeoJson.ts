import { message } from 'antd'
import { useMutation } from '@tanstack/react-query'

import projectApi from '@/services/api/project.api'
import { useAuthStore } from '@/stores/auth.store'

import type {
  Feature,
  FeatureCollection,
  Geometry,
} from 'geojson'
import type { LoginProject } from '@/types/auth.types'

type GeoJson =
  | FeatureCollection
  | Feature
  | Geometry

const useProjectGeoJson = () => {
  const setProject = useAuthStore(
    (s) => s.setProject,
  )

  return useMutation({
    mutationFn: async (
      geojson: GeoJson,
    ) => {
      const project =
        useAuthStore.getState().project

      if (!project) {
        throw new Error(
          'Project not found',
        )
      }

      const { data } =
        await projectApi.updateGeoJson(
          project.id,
          geojson,
        )

      // console.log(data)

      return data.data
    },

    onSuccess: (project) => {
      setProject(
        project as LoginProject,
      )

      message.success(
        'Geofence saved',
      )
    },

    onError: () => {
      message.error(
        'Failed to save geofence',
      )
    },
  })
}

export default useProjectGeoJson