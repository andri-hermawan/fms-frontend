import {
  Marker,
  Popup,
  Tooltip,
  useMap,
} from 'react-leaflet'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import type { Marker as LeafletMarker } from 'leaflet'

import type {
  EquipmentMarkerData,
  EquipmentMarkerProps,
} from '@/types/map.types'
import { getMarkerIcon } from '@/utils/marker-icon'

// Marker terpilih diberi lingkaran pulse + animasi bounce (sama seperti
// PositionHistory) supaya mudah dikenali. Icon di-cache supaya animasi CSS
// tidak restart setiap kali posisi/socket update.
const selectedIconCache = new Map<string, L.DivIcon>()

const getSelectedMarkerIcon = (
  item: EquipmentMarkerData,
  size: number,
): L.DivIcon => {
  const baseIcon = getMarkerIcon(item, size)
  const url = baseIcon.options.iconUrl as string
  const cacheKey = `${url}:${size}`

  const cached = selectedIconCache.get(cacheKey)
  if (cached) return cached

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
      <span style="position:absolute;top:50%;left:50%;width:${size}px;height:${size}px;transform:translate(-50%,-50%);border-radius:50%;background:rgba(6,69,150,.35);z-index:1;animation:ph-pulse-ring 1.6s ease-out infinite;"></span>
      <img src="${url}" alt="" style="width:${size}px;height:${size}px;position:relative;z-index:2;animation:ph-marker-bounce 0.9s ease-in-out infinite;" />
    </div>`

  const icon = L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    tooltipAnchor: [0, -size / 2],
  })

  selectedIconCache.set(cacheKey, icon)
  return icon
}

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
          icon={
            item.equipment_id === selectedEquipment
              ? getSelectedMarkerIcon(item, iconSize)
              : getMarkerIcon(item, iconSize)
          }
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
            className="equipment-popup"
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
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  padding: '2px 24px 2px 8px',
                  margin: '-8px -8px 7px -8px',
                  fontWeight: 600,
                  fontSize: 13,
                  textAlign: 'left',
                  borderRadius: '4px 4px 0 0',
                }}
              >
                <span>{item.equipment_code}</span>
                <span>{item.operator_name?.trim() || 'No Operator Set'}</span>
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
                      }}
                    >
                      Segment
                    </td>
                    <td style={{ padding: '4px 0' }}>
                      {item.segment}
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
                      Coordinate
                    </td>
                    <td style={{ padding: '4px 0' }}>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#1677ff',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                      </a>
                    </td>
                  </tr>

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
                      {item.fuel_volume} L &middot; {item.fuel_percentage}%
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
                    {/* &middot; {item.vessel ? item.vessel: 0} ton */}
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