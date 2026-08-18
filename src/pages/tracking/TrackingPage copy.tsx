import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Input, Button, Badge, Typography, Empty, Spin } from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  WarningOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip as MapTooltip,
  GeoJSON,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './tracking.css'
import dayjs from 'dayjs'
import type { FeatureCollection, Feature, Geometry } from 'geojson'

import { useAuthStore } from '@/stores/auth.store'
import {
  useEquipmentStatusStore,
  selectPositions,
} from '@/stores/equipment-status.store'
import useEquipmentStatusLive from './hooks/useEquipmentStatusLive'
import type { EquipmentLiveStatus } from '@/types/equipment-status.types'

const { Text } = Typography

const ALERT_SECTIONS = [
  { key: 'fuel',       label: 'FUEL DECREASE ALERT' },
  { key: 'underspeed', label: 'UNDERSPEED ALERT' },
  { key: 'overspeed',  label: 'OVERSPEED ALERT' },
  { key: 'offtrack',   label: 'OFF-TRACK ALERT' },
]

const STATUS_COLOR: Record<string, string> = {
  MOVING:  '#52c41a',
  IDLE:    '#faad14',
  OFFLINE: '#090909',
}

const STATUS_LABEL: Record<string, string> = {
  MOVING:  'Moving',
  IDLE:    'Idle',
  OFFLINE: 'Offline',
}

// ─── Polling dipisah ke komponen kecil ─────────────────────
// Tidak render apapun — hanya jalankan hook polling
// Dipisah agar update store tidak trigger re-render TrackingPage
const PollingProvider = ({ projectId }: { projectId?: string }) => {
  useEquipmentStatusLive({ projectId, enabled: true })
  return null
}

// ─── Icon marker ───────────────────────────────────────────
const createIcon = (status: string, heading: number, selected: boolean) => {
  const color = STATUS_COLOR[status] ?? '#999'
  const size  = selected ? 36 : 28
  return L.divIcon({
    html: `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,5 30,35 20,27 10,35"
        fill="${color}" stroke="white" stroke-width="2.5"
        transform="rotate(${heading}, 20, 20)"/>
    </svg>`,
    className:  '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// ─── Map: fokus ke posisi ──────────────────────────────────
const MapController = ({
  focusRef,
}: {
  focusRef: React.MutableRefObject<((pos: [number, number]) => void) | null>
}) => {
  const map = useMap()
  useEffect(() => {
    focusRef.current = (pos) => map.flyTo(pos, 14, { duration: 1 })
    return () => { focusRef.current = null }
  }, [map, focusRef])
  return null
}

// ─── Map: fit bounds sekali saat load ─────────────────────
const FitOnce = ({
  latlngs,
  geoJson,
}: {
  latlngs: [number, number][]
  geoJson: FeatureCollection | Feature | Geometry | null
}) => {
  const map    = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (fitted.current) return

    try {
      if (geoJson) {
        const layer  = L.geoJSON(geoJson as Parameters<typeof L.geoJSON>[0])
        const bounds = layer.getBounds()
        if (bounds.isValid()) {
          fitted.current = true
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
          return
        }
      }
    } catch { /* GeoJSON tidak valid */ }

    if (latlngs.length > 0) {
      fitted.current = true
      map.fitBounds(L.latLngBounds(latlngs), { padding: [60, 60], maxZoom: 13 })
    }
  }, [latlngs, geoJson, map])

  return null
}

// ─── Main Page ─────────────────────────────────────────────
const TrackingPage = () => {
  const [search, setSearch]         = useState('')
  const [tileMode, setTileMode]     = useState<'street' | 'satellite'>('street')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showPanel, setShowPanel]   = useState(false)

  const focusRef = useRef<((pos: [number, number]) => void) | null>(null)

  const project = useAuthStore((s) => s.project)
  // console.log("ini a", project);
  const geoJson = project?.geojson_origin ?? null

  const positionsMap = useEquipmentStatusStore(selectPositions)
  console.log("ini positionsMap", positionsMap);

  // Baca store dengan selector stabil
  const positions = useMemo(
    () => Object.values(positionsMap),
    [positionsMap]
  )
  const isConnected = useEquipmentStatusStore((s) => s.isConnected)
  const isLoading   = positions.length === 0 && !isConnected

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase()

    return positions.filter((p) => {
      const code = (p.equipment_code ?? '').toLowerCase()
      const alias = (p.equipment_alias ?? '').toLowerCase()

      return (
        code.includes(keyword) ||
        alias.includes(keyword)
      )
    })
  }, [positions, search])
  const latlngs = useMemo(
    () => positions.map((p: EquipmentLiveStatus) =>
      [p.latitude, p.longitude] as [number, number]
    ),
    [positions]
  )

  const handleSelect = useCallback((id: string, lat: number, lng: number) => {
    setSelectedId((prev) => (prev === id ? null : id))
    focusRef.current?.([lat, lng])
  }, [])

  const tileUrl = tileMode === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  return (
    <>
      {/* Polling dijalankan di luar tree render utama */}
      <PollingProvider />

      <div style={{
        display: 'flex', flexDirection: 'column',
        height: 'calc(100vh - 64px - 48px - 24px)',
        minHeight: 500, overflow: 'hidden',
        borderRadius: 8, border: '1px solid #e8e8e8',
        background: '#fff',
      }}>

        {/* ── Top bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px', height: 48,
          borderBottom: '1px solid #e8e8e8',
          flexShrink: 0, background: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 18, background: '#1677ff', borderRadius: 2 }} />
            <Text strong style={{ fontSize: 13, letterSpacing: 0.5 }}>LIVE TRACKING</Text>
            <Badge
              status={isConnected ? 'processing' : 'error'}
              text={<Text style={{ fontSize: 11, color: '#888' }}>
                {isConnected ? 'Live' : 'Offline'}
              </Text>}
            />
            {project && (
              <Text style={{ fontSize: 11, color: '#1677ff', fontWeight: 500 }}>
                {project.project_code} — {project.project_name}
              </Text>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              border: '1px solid #d9d9d9', borderRadius: 6,
              padding: '3px 10px', fontSize: 12, color: '#666',
            }}>
              {dayjs().format('D/M/YYYY')}
            </div>
            <Button size="small" style={{ fontSize: 12, fontWeight: 600 }}>
              SHIFT 1
            </Button>
            <Button
              size="small"
              type={showPanel ? 'default' : 'primary'}
              icon={showPanel ? <CloseOutlined /> : <InfoCircleOutlined />}
              style={{ fontSize: 12 }}
              onClick={() => setShowPanel((prev) => !prev)}
            >
              {showPanel ? 'CLOSE PANEL' : 'OPEN PANEL'}
            </Button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* ── Peta ── */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

            {isLoading && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.75)',
              }}>
                <Spin
                  size="large"
                  description="Memuat posisi kendaraan..."
                />
              </div>
            )}

            <div style={{
              position: 'absolute', top: 10, right: 10, zIndex: 1000,
              display: 'flex', border: '1px solid #ccc', borderRadius: 4,
              overflow: 'hidden', background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}>
              {(['street', 'satellite'] as const).map((m) => (
                <button key={m} onClick={() => setTileMode(m)} style={{
                  padding: '5px 14px', fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: tileMode === m ? '#1677ff' : '#fff',
                  color: tileMode === m ? '#fff' : '#333',
                  textTransform: 'uppercase', letterSpacing: 0.3,
                }}>{m}</button>
              ))}
            </div>

            <MapContainer
              center={[-3.0, 104.1]} zoom={8}
              style={{ width: '100%', height: '100%' }}
              zoomControl
            >
              <TileLayer url={tileUrl} maxZoom={19} />

              {geoJson && !Array.isArray(geoJson) && (
                <GeoJSON
                  key={JSON.stringify(geoJson).substring(0, 50)}
                  data={geoJson as Exclude<Parameters<typeof L.geoJSON>[0], null | undefined | GeoJSON.GeoJsonObject[]>}
                  style={() => ({
                    color: '#1677ff', weight: 2.5, opacity: 0.85,
                    fillColor: '#1677ff', fillOpacity: 0.08,
                  })}
                />
              )}

              {positions.map((pos: EquipmentLiveStatus) => (
                <Marker
                  key={pos.equipment_id}
                  position={[pos.latitude, pos.longitude]}
                  icon={createIcon(pos.status, pos.heading, selectedId === pos.equipment_id)}
                  zIndexOffset={selectedId === pos.equipment_id ? 1000 : 0}
                  eventHandlers={{
                    click: () => handleSelect(pos.equipment_id, pos.latitude, pos.longitude),
                  }}
                >
                  <MapTooltip direction="top" offset={[0, -16]} permanent className="equipment-label">
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{pos.equipment_code}</span>
                  </MapTooltip>
                </Marker>
              ))}

              <MapController focusRef={focusRef} />
              <FitOnce latlngs={latlngs} geoJson={geoJson} />
            </MapContainer>
          </div>

          {/* ── Panel kanan ── */}
          {showPanel && (
            <div style={{ display: 'flex', height: '100%', flexShrink: 0 }}>

              {/* Search + list */}
              <div style={{
                width: 260, display: 'flex', flexDirection: 'column',
                background: '#fafafa',
                borderLeft: '1px solid #e8e8e8',
                borderRight: '1px solid #e8e8e8',
              }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid #e8e8e8', background: '#fff' }}>
                  <Input
                    prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                    placeholder="Search equipment code..."
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                  />
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {filtered.length === 0
                    ? <div style={{ padding: 24 }}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={<Text style={{ fontSize: 12 }}>Tidak ada data</Text>} />
                      </div>
                    : filtered.map((pos: EquipmentLiveStatus) => {
                        console.log("cek data", pos);
                        const color    = STATUS_COLOR[pos.status] ?? '#999'
                        const isActive = selectedId === pos.equipment_id
                        return (
                          <div key={pos.equipment_id}
                            onClick={() => handleSelect(pos.equipment_id, pos.latitude, pos.longitude)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 14px', cursor: 'pointer',
                              background: isActive ? '#e6f4ff' : 'transparent',
                              borderLeft: `3px solid ${isActive ? '#1677ff' : 'transparent'}`,
                              borderBottom: '1px solid #f0f0f0',
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
                              <polygon points="20,4 32,36 20,28 8,36"
                                fill={color} stroke="white" strokeWidth="2"
                                transform={`rotate(${pos.heading}, 20, 20)`} />
                            </svg>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, fontStyle: 'italic' }}>
                                {pos.equipment_code}
                              </div>
                              <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>
                                {pos.equipment_alias}
                              </div>
                            </div>
                            <div style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: color, flexShrink: 0,
                            }} />
                          </div>
                        )
                      })
                  }
                </div>
              </div>

              {/* Status + alerts */}
              <div style={{
                width: 300, display: 'flex', flexDirection: 'column',
                overflow: 'hidden', background: '#fff',
              }}>

                {/* Dump Truck Status */}
                <div style={{
                  flexShrink: 0, borderBottom: '1px solid #e8e8e8',
                  maxHeight: '45%', display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{
                    padding: '9px 14px', fontSize: 12, fontWeight: 700,
                    letterSpacing: 0.5, color: '#333',
                    borderBottom: '1px solid #f0f0f0', flexShrink: 0,
                  }}>
                    DUMP TRUCK STATUS
                  </div>

                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 14px', borderBottom: '1px solid #f5f5f5',
                    }}>
                      <ReloadOutlined style={{ fontSize: 13, color: '#888' }} />
                      <Text style={{ fontSize: 13 }}>{positions.length} Total</Text>
                    </div>

                    {positions.map((pos: EquipmentLiveStatus) => (
                      <div key={pos.equipment_id}
                        onClick={() => handleSelect(pos.equipment_id, pos.latitude, pos.longitude)}
                        style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 14px', cursor: 'pointer',
                          borderBottom: '1px solid #f5f5f5',
                          background: selectedId === pos.equipment_id ? '#e6f4ff' : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="14" height="14" viewBox="0 0 40 40">
                            <polygon points="20,4 32,36 20,28 8,36"
                              fill={STATUS_COLOR[pos.status] ?? '#999'}
                              stroke="white" strokeWidth="2" />
                          </svg>
                          <div>
                            <Text style={{
                              fontSize: 12, fontWeight: 600,
                              color: STATUS_COLOR[pos.status], display: 'block',
                            }}>
                              {pos.equipment_code}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#888' }}>
                              {STATUS_LABEL[pos.status]}
                            </Text>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alert sections */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {ALERT_SECTIONS.map((section) => (
                    <div key={section.key} style={{ borderBottom: '1px solid #e8e8e8' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 12px', background: '#fafafa',
                        borderBottom: '1px solid #f0f0f0',
                      }}>
                        <WarningOutlined style={{ fontSize: 12, color: '#faad14' }} />
                        <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
                          {section.label}
                        </Text>
                      </div>

                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 80px 70px',
                        padding: '4px 12px', background: '#f9f9f9',
                      }}>
                        {['Unit', 'Alert Count', 'Duration'].map((h) => (
                          <Text key={h} style={{ fontSize: 10, color: '#999', fontWeight: 600 }}>
                            {h}
                          </Text>
                        ))}
                      </div>

                      <div style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <Text style={{ fontSize: 11, color: '#bbb', fontStyle: 'italic' }}>
                          No alert data available
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TrackingPage
