import {
  Marker,
  Popup,
  Tooltip,
  useMap,
} from 'react-leaflet'
import { useEffect, useRef, useState } from 'react'
import type { Marker as LeafletMarker } from 'leaflet'

import type { EquipmentMarkerProps } from '@/types/map.types'
import { getMarkerIcon } from '@/utils/marker-icon'

const EquipmentMarker = ({
  equipments,
  selectedEquipment,
  onSelectEquipment,
}: EquipmentMarkerProps) => {
  const map = useMap()
  const [iconSize, setIconSize] = useState(
    map.getZoom() >= 19 ? 64 : 32,
  )

  const markerRefs = useRef<
    Record<string, LeafletMarker | null>
  >({})

  useEffect(() => {
    const updateIconSize = () => {
      setIconSize(map.getZoom() >= 19 ? 64 : 32)
    }

    map.on('zoomend', updateIconSize)
    return () => {
      map.off('zoomend', updateIconSize)
    }
  }, [map])

  useEffect(() => {
    Object.values(markerRefs.current).forEach(
      (marker) => marker?.closePopup(),
    )

    if (!selectedEquipment) return

    const marker =
      markerRefs.current[selectedEquipment]

    if (!marker) return

    map.flyTo(
      marker.getLatLng(),
      map.getZoom(),
      {
        animate: true,
        duration: 0.5,
      },
    )

    marker.openPopup()
  }, [selectedEquipment, map])
  return (
    <>
      {equipments.map((item) => (
         
        <Marker
          key={item.equipment_id}
          position={[
            item.latitude,
            item.longitude,
          ]}
          icon={getMarkerIcon(item, iconSize)}
          zIndexOffset={
            item.equipment_id ===
            selectedEquipment
              ? 1000
              : 0
          }
          ref={(ref) => {
            markerRefs.current[
              item.equipment_id
            ] = ref
          }}
          eventHandlers={{
            click: () => {
              onSelectEquipment?.(
                item.equipment_id,
              )
            },
          }}
        >
          {/* <Tooltip
            permanent
            direction="top"
            offset={[0, -18]}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: 11,
              }}
            >
              {item.equipment_code}
            </span>
          </Tooltip> */}

          <Tooltip
            key={`${item.equipment_id}-${iconSize}`}
            permanent
            direction="top"
            offset={[0, 0]}
            className="equipment-code-tooltip"
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: 9,
              }}
            >
              {item.equipment_code}
            </span>
          </Tooltip>

          <Popup
            minWidth={220}
            maxWidth={240}
            autoPan
            closeButton
          >
            <div
              style={{
                fontSize: 12,
                fontFamily: 'Segoe UI, sans-serif',
                color: '#333',
                minWidth: 210,
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '8px 10px',
                  margin: '-9px -9px 8px -9px',
                  fontWeight: 600,
                  fontSize: 13,
                  textAlign: 'left',
                  borderRadius: '4px 4px 0 0',
                }}
              >
                {item.equipment_code}
              </div>

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        fontWeight: 600,
                        color: '#666',
                        padding: '4px 0',
                        width: 75,
                      }}
                    >
                      Engine
                    </td>
                    <td
                      style={{
                        padding: '4px 0',
                        textAlign: 'left',
                        color: item.engine_status ? '#389e0d' : '#cf1322',
                        fontWeight: 600,
                      }}
                    >
                      {item.engine_status ? 'ON' : 'OFF'}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        fontWeight: 600,
                        color: '#666',
                        padding: '4px 0',
                      }}
                    >
                      Speed
                    </td>
                    <td style={{ padding: '4px 0' }}>
                      {item.speed} km/h
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        fontWeight: 600,
                        color: '#666',
                        padding: '4px 0',
                      }}
                    >
                      Fuel
                    </td>
                    <td style={{ padding: '4px 0' }}>
                      {item.fuel_volume} liter , {item.fuel_percentage} %
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        fontWeight: 600,
                        color: '#666',
                        padding: '4px 0',
                      }}
                    >
                      Vessel
                    </td>
                    <td style={{ padding: '4px 0' }}>
                      {item.vessel_status}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        fontWeight: 600,
                        color: '#666',
                        padding: '4px 0',
                      }}
                    >
                      Alert
                    </td>
                    <td
                      style={{
                        padding: '4px 0',
                        color: item.alert_count > 0 ? '#cf1322' : '#389e0d',
                        fontWeight: 600,
                      }}
                    >
                      {item.alert_count}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export default EquipmentMarker