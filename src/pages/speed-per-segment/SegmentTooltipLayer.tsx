import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import type { GeoJsonObject } from 'geojson'

interface Props {
  geoJson: GeoJsonObject | null
}

const SegmentTooltipLayer = ({ geoJson }: Props) => {
  if (!geoJson) return null

  const data = geoJson as Parameters<typeof L.geoJSON>[0]
  if (!data || Array.isArray(data)) return null

  return (
    <GeoJSON
      data={data}
      style={{
        color: '#6b7280',
        weight: 2,
        opacity: 1,
        fillColor: '#d1d5db',
        fillOpacity: 0.25,
      }}
      onEachFeature={(feature, layer) => {
        const props = feature.properties ?? {}
        const segName = props.Segment ?? props.segment ?? '-'

        layer.bindTooltip(
          `<div style="font-size:10px;line-height:1.3">
            <b style="font-size:11px">${segName}</b><br/>
            <span style="color:#555">S,Empty</span> <span style="color:#064596;font-weight:600">29.1</span><br/>
            <span style="color:#555">S,Loaded</span> <span style="color:#064596;font-weight:600">18.4</span>
          </div>`,
          {
            permanent: true,
            direction: 'center',
            className: 'segment-tooltip-label',
            opacity: 0.85,
          },
        )

        // Open tooltip at polygon center
        try {
          const center = (layer as L.Polygon).getCenter?.()
          if (center) {
            layer.openTooltip(center)
          }
        } catch {
          // fallback
        }
      }}
    />
  )
}

export default SegmentTooltipLayer