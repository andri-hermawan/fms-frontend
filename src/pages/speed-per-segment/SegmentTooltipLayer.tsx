import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import type { GeoJsonObject } from 'geojson'
import type { SegmentSpeedSummary } from '@/types/equipment-logs.types'

interface Props {
  geoJson: GeoJsonObject | null
  speedData?: SegmentSpeedSummary[]
  showAllLabels?: boolean
}

const SegmentTooltipLayer = ({ geoJson, speedData, showAllLabels = false }: Props) => {
  if (!geoJson) return null

  const data = geoJson as Parameters<typeof L.geoJSON>[0]
  if (!data || Array.isArray(data)) return null

  const baseStyle: L.PathOptions = {
    color: '#6b7280',
    weight: 2,
    opacity: 1,
    fillColor: '#d1d5db',
    fillOpacity: 0.25,
  }

  return (
    <GeoJSON
      key={`geo-${speedData?.length ?? 0}-${showAllLabels ? 'labels' : 'hover'}`}
      data={data}
      style={baseStyle}
      onEachFeature={(feature, layer) => {
        const props = feature.properties ?? {}
        const segName = props.Segment ?? props.segment ?? '-'

        const match = speedData?.find(
          (s) => s.segment.toLowerCase() === segName.toLowerCase(),
        )
        const emptySpeed = match?.avg_speed_empty ?? '-'
        const loadedSpeed = match?.avg_speed_loaded ?? '-'

        // console.log('[SegmentTooltipLayer] segName raw:', JSON.stringify(segName), '| speedData segments:', JSON.stringify(speedData?.map(s => s.segment)), '| match:', match, '| emptySpeed:', emptySpeed, '| loadedSpeed:', loadedSpeed, '| speedData:', speedData)

        // Tooltip hanya tampil saat polygon di-hover (tanpa `permanent`),
        // dan `sticky: true` membuatnya mengikuti kursor sehingga tidak
        // menumpuk permanen di tengah polygon / menutupi marker.
        layer.bindTooltip(
          `<div style="font-size:10px;line-height:1.3">
            <b style="font-size:11px">${segName}</b><br/>
            <span style="color:#555">S,Empty</span> <span style="color:#064596;font-weight:600">${emptySpeed}</span><br/>
            <span style="color:#555">S,Loaded</span> <span style="color:#064596;font-weight:600">${loadedSpeed}</span>
          </div>`,
          {
            permanent: showAllLabels,
            sticky: true,
            direction: 'top',
            offset: [0, -10],
            className: 'segment-tooltip-label',
            opacity: 0.95,
          },
        )

        // Highlight polygon saat hover agar area yang dibaca terlihat jelas
        // (dihapus — cukup tooltip saja)

        if (showAllLabels) {
          // onEachFeature berjalan sebelum layer masuk ke map, sehingga
          // openTooltip() saat ini akan error (map belum tersedia).
          // Tunda sampai layer benar-benar ter-add ke map.
          layer.once('add', () => {
            // Anchor awal mengikuti label point polygon seperti ArcGIS,
            // bukan posisi default tooltip yang dapat bergeser ke tepi layer.
            const polygon = layer as L.Polygon
            const center = polygon.getCenter?.()
            if (center) {
              layer.openTooltip(center)
            }
          })
        }
      }}
    />
  )
}

export default SegmentTooltipLayer