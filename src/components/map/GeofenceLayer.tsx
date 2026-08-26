import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'

import type { GeofenceLayerProps } from '@/types/map.types'

const GeofenceLayer = ({
  geoJson,
  segmentStats,
}: GeofenceLayerProps) => {
  if (!geoJson) return null

  const data = geoJson as Parameters<typeof L.geoJSON>[0]
  if (!data || Array.isArray(data)) return null

  return (
    <GeoJSON
      data={data}
      style={(feature) => ({
        color:
          feature?.properties?.color ??
          '#6b7280',
        weight: 2,
        opacity: 1,
        fillColor:
          feature?.properties
            ?.fillColor ??
          '#d1d5db',
        fillOpacity: 0.25,
      })}
      onEachFeature={(
        feature,
        layer,
      ) => {
        const props =
          feature.properties ?? {}
        const segName = props.Segment ?? props.segment ?? '-'

        layer.bindPopup(`
          <div style="min-width:180px">
            <b>Segment : ${segName}</b><br/>
            Location  : ${props.Category ?? '-'}<br/>
            Orig Fid : ${props.CODE ?? '-'}<br/>
          </div>
        `)
      }}
    />
  )
}

export default GeofenceLayer