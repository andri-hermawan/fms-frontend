import { useEffect } from 'react'
import L, { LatLngBounds, type Layer } from 'leaflet'
import { useMap } from 'react-leaflet'
import type { Feature, GeoJsonObject } from 'geojson'

interface Props {
  geoJson: GeoJsonObject | null
  segment?: string
}

const SegmentMapController = ({ geoJson, segment }: Props) => {
  const map = useMap()

  useEffect(() => {
    if (!geoJson || !segment || segment === 'all') return

    const bounds = new LatLngBounds([])
    const layerGroup = L.geoJSON(geoJson)

    layerGroup.eachLayer((layer: Layer) => {
      const feature = (layer as Layer & { feature?: Feature }).feature
      const properties = feature?.properties as
        | Record<string, unknown>
        | null
        | undefined
      const featureSegment = properties?.Segment ?? properties?.segment
      const boundsLayer = layer as Layer & {
        getBounds?: () => LatLngBounds
      }

      if (
        typeof featureSegment === 'string' &&
        featureSegment.trim().toLowerCase() === segment.trim().toLowerCase() &&
        boundsLayer.getBounds
      ) {
        bounds.extend(boundsLayer.getBounds())
      }
    })

    if (bounds.isValid()) {
      requestAnimationFrame(() => {
        map.invalidateSize()
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 19 })
      })
    }
  }, [geoJson, map, segment])

  return null
}

export default SegmentMapController