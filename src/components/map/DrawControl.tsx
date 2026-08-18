import {
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { useMap } from 'react-leaflet'
import { notification } from 'antd'
import L from 'leaflet'
import 'leaflet-draw'

import { useAuthStore } from '@/stores/auth.store'
import useProjectGeoJson from '@/hooks/useProjectGeoJson'

import type { DrawControlProps } from '@/types/map.types'

const DrawControl = ({
  editable = true,
  onCreate,
  onEdit,
  onDelete,
}: DrawControlProps) => {
  const map = useMap()

  const project = useAuthStore(
    (s) => s.project,
  )

  const role = useAuthStore(
    (s) => s.user?.role,
  )

  const canEdit =
    editable &&
    (role === 'superadmin' ||
      role === 'admin')

  const { mutate } =
    useProjectGeoJson()

  const drawRef =
    useRef<L.Control.Draw | null>(null)

  const featureGroupRef =
    useRef<L.FeatureGroup | null>(null)

  const saveTimeout =
    useRef<number | undefined>(undefined)

  const saveGeoJson =
    useCallback(() => {
      if (!featureGroupRef.current) return

      const geojson =
        featureGroupRef.current.toGeoJSON() as GeoJSON.FeatureCollection

      notification.open({
        key: 'geojson-save',
        title: 'Saving...',
        duration: 0,
      })

      mutate(geojson, {
        onSuccess: () => {
          notification.success({
            key: 'geojson-save',
            title: 'Saved successfully',
          })
        },

        onError: () => {
          notification.error({
            key: 'geojson-save',
            message:
              'Failed to save',
          })
        },
      })
    }, [mutate])

  const debounceSave =
    useCallback(() => {
      if (saveTimeout.current) {
        clearTimeout(
          saveTimeout.current,
        )
      }

      saveTimeout.current =
        window.setTimeout(
          saveGeoJson,
          500,
        )
    }, [saveGeoJson])

    useEffect(() => {
      // console.log('PROJECT GEOJSON',project?.geojson_origin)

      if (!featureGroupRef.current) {
        featureGroupRef.current = new L.FeatureGroup()
        map.addLayer(featureGroupRef.current)
        
        if (
          project?.geojson_origin &&
          typeof project.geojson_origin === 'object'
        ) {
          L.geoJSON(
            project.geojson_origin as GeoJSON.GeoJsonObject,
            {
              interactive: false,
              style: {
                color: '#6b7280',
                weight: 2,
                opacity: 1,
                fillColor: '#d1d5db',
                fillOpacity: 0.25,
              },
              onEachFeature: (_, layer) => {
                layer.off()

                if ('unbindPopup' in layer) {
                  ;(layer as L.Layer & {
                    unbindPopup(): void
                  }).unbindPopup()
                }

                if ('unbindTooltip' in layer) {
                  ;(layer as L.Layer & {
                    unbindTooltip(): void
                  }).unbindTooltip()
                }
              },
            },
          ).eachLayer((layer) => {
            featureGroupRef.current!.addLayer(layer)
          })
        }
      }

      const featureGroup = featureGroupRef.current

      if (
        canEdit &&
        !drawRef.current
      ) {
        drawRef.current =
          new L.Control.Draw({
            position: 'topleft',

            draw: {
              polygon: {
                shapeOptions: {
                  color: '#6b7280',
                  weight: 2,
                  opacity: 1,
                  fillColor: '#d1d5db',
                  fillOpacity: 0.25,
                },
              },
              polyline: {},
              rectangle: {},
              circle: {},
              marker: {},
              circlemarker: false,
            },

            edit: {
              featureGroup,
            },
          })

        map.addControl(drawRef.current)
      }

      const created = (
        event: L.LeafletEvent,
      ) => {
        const e =
          event as L.DrawEvents.Created

        featureGroup.addLayer(e.layer)

        onCreate?.(
          e.layer.toGeoJSON() as GeoJSON.GeoJSON,
        )

        debounceSave()
      }

      const edited = (
        event: L.LeafletEvent,
      ) => {
        const e =
          event as L.DrawEvents.Edited

        e.layers.eachLayer((layer) => {
          onEdit?.(
            (
              layer as L.Layer & {
                toGeoJSON(): GeoJSON.GeoJSON
              }
            ).toGeoJSON(),
          )
        })

        debounceSave()
      }

     const deleted = (
  event: L.LeafletEvent,
) => {
  const e =
    event as L.DrawEvents.Deleted

  console.log(
    'Deleted Layers:',
    e.layers.getLayers().length,
  )

  console.log(
    'Remaining:',
    featureGroupRef.current?.getLayers()
      .length,
  )

  onDelete?.()

  debounceSave()
}

      map.on(
        L.Draw.Event.CREATED,
        created as L.LeafletEventHandlerFn,
      )

      map.on(
        L.Draw.Event.EDITED,
        edited as L.LeafletEventHandlerFn,
      )

      map.on(
        L.Draw.Event.DELETED,
        deleted as L.LeafletEventHandlerFn,
      )

      return () => {
        map.off(
          L.Draw.Event.CREATED,
          created as L.LeafletEventHandlerFn,
        )

        map.off(
          L.Draw.Event.EDITED,
          edited as L.LeafletEventHandlerFn,
        )

        map.off(
          L.Draw.Event.DELETED,
          deleted as L.LeafletEventHandlerFn,
        )
      }
    }, [
      map,
      canEdit,
      project,
      debounceSave,
      onCreate,
      onEdit,
      onDelete,
    ])

  return null
}

export default DrawControl