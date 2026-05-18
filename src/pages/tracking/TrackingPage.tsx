import { useState, useRef, useCallback, useEffect } from 'react'
import { Input, Button, Badge, Typography, Empty } from 'antd'
import {
  SearchOutlined,
  AimOutlined,
  DownloadOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { MapContainer, TileLayer, Marker, Tooltip as MapTooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './tracking.css'
import useTracking from './hooks/useTracking'
import { useTrackingStore, selectAllPositions } from '@/stores/tracking.store'
import type { VehiclePosition } from '@/services/api/tracking.api'
import { createEquipmentIcon, getStatusColor } from '@/utils/map'
// import { formatDate } from '@/utils/format'
import dayjs from 'dayjs'

const { Text } = Typography

// ─── Konstanta ─────────────────────────────────────────────
const ALERT_SECTIONS = [
  { key: 'fuel',       label: 'FUEL DECREASE ALERT' },
  { key: 'underspeed', label: 'UNDERSPEED ALERT' },
  { key: 'overspeed',  label: 'OVERSPEED ALERT' },
  { key: 'offtrack',   label: 'OFF-TRACK ALERT' },
]

// ─── Focus map helper ──────────────────────────────────────
const FocusController = ({
  triggerRef,
}: {
  triggerRef: React.MutableRefObject<((pos: [number, number]) => void) | null>
}) => {
  const map = useMap()

  useEffect(() => {
    triggerRef.current = (pos) => {
      map.flyTo(pos, 14, { duration: 1 })
    }
    return () => {
      triggerRef.current = null
    }
  }, [map, triggerRef])

  return null
}

// ─── Fit bounds helper ─────────────────────────────────────
const FitBoundsOnLoad = ({ positions }: { positions: VehiclePosition[] }) => {
  const map    = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (fitted.current || positions.length === 0) return
    fitted.current = true
    const bounds = L.latLngBounds(
      positions.map((p) => [p.latitude, p.longitude] as [number, number])
    )
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }, [positions, map])

  return null
}

// ─── Main Page ─────────────────────────────────────────────
const TrackingPage = () => {
  const [search, setSearch]             = useState('')
  const [tileMode, setTileMode]         = useState<'street' | 'satellite'>('street')
  const [collapsedAlerts, setCollapsedAlerts] = useState<Record<string, boolean>>({})
  const [selectedId, setSelectedId]     = useState<string | null>(null)
  const focusRef = useRef<((pos: [number, number]) => void) | null>(null)

  const { isConnected } = useTracking()
  const allPositions    = useTrackingStore(selectAllPositions)

  // const activeCount = allPositions.filter((p) => p.movement_status === 'moving').length

  // Filter equipment by search
  const filtered = allPositions.filter((p) =>
    p.equipment_code.toLowerCase().includes(search.toLowerCase()) ||
    p.equipment_alias?.toLowerCase().includes(search.toLowerCase())
  )

  // const selectedPos = allPositions.find((p) => p.equipment_id === selectedId) ?? null

  const handleEquipmentClick = useCallback((pos: VehiclePosition) => {
    setSelectedId(pos.equipment_id)
    focusRef.current?.([pos.latitude, pos.longitude])
  }, [])

  const toggleAlert = (key: string) => {
    setCollapsedAlerts((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const tileUrl = tileMode === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px - 48px - 24px)',
      minHeight: 500,
      overflow: 'hidden',
      borderRadius: 8,
      border: '1px solid #e8e8e8',
      background: '#fff',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: 48,
        borderBottom: '1px solid #e8e8e8',
        flexShrink: 0,
        background: '#fff',
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 18, background: '#1677ff', borderRadius: 2 }} />
          <Text strong style={{ fontSize: 13, letterSpacing: 0.5 }}>LIVE TRACKING</Text>
          <Badge
            status={isConnected ? 'processing' : 'error'}
            text={<Text style={{ fontSize: 11, color: '#888' }}>
              {isConnected ? 'Live' : 'Offline'}
            </Text>}
          />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            padding: '3px 10px',
            fontSize: 12,
            color: '#666',
          }}>
            {dayjs().format('D/M/YYYY')}
          </div>
          <Button size="small" style={{ fontSize: 12, fontWeight: 600 }}>
            SHIFT 1
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<AimOutlined />}
            style={{ fontSize: 12 }}
            onClick={() => {
              if (allPositions.length > 0) {
                const p = allPositions[0]
                focusRef.current?.([p.latitude, p.longitude])
              }
            }}
          >
            FOCUS MAP
          </Button>
        </div>
      </div>

      {/* ── Body: map + panels ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Map area ── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

          {/* Street / Satellite toggle */}
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1000,
            display: 'flex',
            border: '1px solid #ccc',
            borderRadius: 4,
            overflow: 'hidden',
            background: '#fff',
          }}>
            {(['street', 'satellite'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTileMode(mode)}
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: tileMode === mode ? '#1677ff' : '#fff',
                  color: tileMode === mode ? '#fff' : '#333',
                  textTransform: 'uppercase',
                  letterSpacing: 0.3,
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          <MapContainer
            center={[-2.5, 118]}
            zoom={5}
            style={{ width: '100%', height: '100%' }}
            zoomControl
          >
            <TileLayer url={tileUrl} maxZoom={19} />

            {allPositions.map((pos) => (
              <Marker
                key={pos.equipment_id}
                position={[pos.latitude, pos.longitude]}
                icon={createEquipmentIcon(
                  pos.movement_status,
                  pos.heading,
                  selectedId === pos.equipment_id
                )}
                eventHandlers={{
                  click: () => handleEquipmentClick(pos),
                }}
                zIndexOffset={selectedId === pos.equipment_id ? 1000 : 0}
              >
                <MapTooltip
                  direction="top"
                  offset={[0, -14]}
                  permanent
                  className="equipment-label"
                >
                  <span style={{ fontSize: 11, fontWeight: 600 }}>
                    {pos.equipment_code}
                  </span>
                </MapTooltip>
              </Marker>
            ))}

            <FocusController triggerRef={focusRef} />
            <FitBoundsOnLoad positions={allPositions} />
          </MapContainer>
        </div>

        {/* ── Panel tengah: equipment list ── */}
        <div style={{
          width: 270,
          borderLeft: '1px solid #e8e8e8',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
          background: '#fafafa',
        }}>
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #e8e8e8' }}>
            <Input
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              placeholder="Search equipment code..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24 }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<Text style={{ fontSize: 12 }}>Tidak ada data</Text>}
                />
              </div>
            ) : (
              filtered.map((pos) => {
                const color     = getStatusColor(pos.movement_status)
                const isActive  = selectedId === pos.equipment_id
                return (
                  <div
                    key={pos.equipment_id}
                    onClick={() => handleEquipmentClick(pos)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      background: isActive ? '#e6f4ff' : 'transparent',
                      borderLeft: isActive ? `3px solid #1677ff` : '3px solid transparent',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Icon panah */}
                    <svg width="18" height="18" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
                      <polygon
                        points="20,4 32,36 20,28 8,36"
                        fill={color}
                        stroke="white"
                        strokeWidth="2"
                        transform={`rotate(${pos.heading}, 20, 20)`}
                      />
                    </svg>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#222' }}>
                        {pos.equipment_code}
                      </div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>
                        {pos.equipment_alias}
                      </div>
                    </div>

                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: color,
                      flexShrink: 0,
                    }} />
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── Panel kanan: status + alerts ── */}
        <div style={{
          width: 280,
          borderLeft: '1px solid #e8e8e8',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
          background: '#fff',
        }}>

          {/* Dump Truck Status */}
          <div style={{ flexShrink: 0, borderBottom: '1px solid #e8e8e8' }}>
            <div style={{
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: '#333',
              borderBottom: '1px solid #f0f0f0',
              textAlign: 'center',
            }}>
              DUMP TRUCK STATUS
            </div>

            <div style={{ padding: '8px 0' }}>
              {/* Total */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ReloadOutlined style={{ fontSize: 13, color: '#888' }} />
                  <Text style={{ fontSize: 13 }}>{allPositions.length} Total</Text>
                </div>
                <DownloadOutlined style={{ fontSize: 13, color: '#888', cursor: 'pointer' }} />
              </div>

              {/* Per status */}
              {allPositions.map((pos) => {
                const color = getStatusColor(pos.movement_status)
                const label = pos.movement_status === 'moving'   ? 'Moving Empty'
                            : pos.movement_status === 'idle'     ? 'Idle'
                            : 'Stopped'
                return (
                  <div
                    key={pos.equipment_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 14px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleEquipmentClick(pos)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 40 40">
                        <polygon
                          points="20,4 32,36 20,28 8,36"
                          fill={color}
                          stroke="white"
                          strokeWidth="2"
                        />
                      </svg>
                      <Text style={{ fontSize: 12, color, fontWeight: 500 }}>
                        1 {label}
                      </Text>
                    </div>
                    <DownloadOutlined style={{ fontSize: 12, color: '#aaa', cursor: 'pointer' }} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Alert sections */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {ALERT_SECTIONS.map((section) => {
              const isDown = collapsedAlerts[section.key]
              return (
                <div key={section.key} style={{ borderBottom: '1px solid #e8e8e8' }}>
                  {/* Section header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    background: '#fafafa',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <WarningOutlined style={{ fontSize: 12, color: '#faad14' }} />
                      <Text style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}>
                        {section.label}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        style={{
                          padding: '1px 8px', fontSize: 10, fontWeight: 600,
                          border: '1px solid #d9d9d9', borderRadius: 3,
                          background: '#fff', cursor: 'pointer', color: '#555',
                        }}
                      >
                        MAP
                      </button>
                      <button
                        onClick={() => toggleAlert(section.key)}
                        style={{
                          padding: '1px 8px', fontSize: 10, fontWeight: 600,
                          border: 'none', borderRadius: 3,
                          background: '#222', cursor: 'pointer', color: '#fff',
                        }}
                      >
                        {isDown ? 'UP' : 'DOWN'}
                      </button>
                    </div>
                  </div>

                  {/* Section content */}
                  {!isDown && (
                    <div>
                      {/* Table header */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 80px 70px',
                        padding: '4px 10px',
                        background: '#f5f5f5',
                        borderTop: '1px solid #f0f0f0',
                      }}>
                        {['Unit', 'Alert Count', 'Duration'].map((h) => (
                          <Text key={h} style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>
                            {h}
                          </Text>
                        ))}
                      </div>

                      {/* Empty state */}
                      <div style={{
                        padding: '12px 10px',
                        textAlign: 'center',
                      }}>
                        <Text style={{ fontSize: 11, color: '#bbb', fontStyle: 'italic' }}>
                          No alert data available
                        </Text>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackingPage
