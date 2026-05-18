import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Input, Button, Badge, Typography, Empty } from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  WarningOutlined,
  CloseOutlined,
  InfoOutlined,
} from '@ant-design/icons'
import { MapContainer, TileLayer, Marker, Tooltip as MapTooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './tracking.css'
import dayjs from 'dayjs'

const { Text } = Typography

// ─── Types ─────────────────────────────────────────────────
interface EquipmentPos {
  equipment_id: string
  equipment_code: string
  equipment_alias: string
  equipment_type: string
  latitude: number
  longitude: number
  speed: number
  heading: number
  movement_status: 'moving' | 'idle' | 'stopped'
  ignition: boolean
  fuel_level: number | null
  recorded_at: string
}

// ─── Dummy data ─────────────────────────────────────────────
const DUMMY_POSITIONS: EquipmentPos[] = [
  {
    equipment_id: 'eq-1',
    equipment_code: 'DT10201',
    equipment_alias: 'Dump Truck 201',
    equipment_type: 'truck',
    latitude: -3.35,
    longitude: 104.12,
    speed: 45,
    heading: 180,
    movement_status: 'moving',
    ignition: true,
    fuel_level: 72,
    recorded_at: "2026-05-18T07:00:00.000Z",
  },
  {
    equipment_id: 'eq-2',
    equipment_code: 'DT10202',
    equipment_alias: 'Dump Truck 202',
    equipment_type: 'truck',
    latitude: -2.98,
    longitude: 104.08,
    speed: 0,
    heading: 90,
    movement_status: 'idle',
    ignition: true,
    fuel_level: 45,
    recorded_at: "2026-05-18T07:00:00.000Z",
  },
  {
    equipment_id: 'eq-3',
    equipment_code: 'DT10203',
    equipment_alias: 'Dump Truck 203',
    equipment_type: 'truck',
    latitude: -2.98,
    longitude: 104.08,
    speed: 0,
    heading: 90,
    movement_status: 'stopped',
    ignition: true,
    fuel_level: 45,
    recorded_at: "2026-05-18T07:00:00.000Z",
  },
]

const ALERT_SECTIONS = [
  { key: 'fuel',       label: 'FUEL DECREASE ALERT' },
  { key: 'underspeed', label: 'UNDERSPEED ALERT' },
  { key: 'overspeed',  label: 'OVERSPEED ALERT' },
  { key: 'offtrack',   label: 'OFF-TRACK ALERT' },
]

const STATUS_COLOR: Record<string, string> = {
  moving:  '#52c41a',
  idle:    '#faad14',
  stopped: '#ff4d4f',
}

const STATUS_LABEL: Record<string, string> = {
  moving:  'Moving Empty',
  idle:    'Idle',
  stopped: 'Stopped',
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
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// ─── Map helpers ───────────────────────────────────────────
const MapController = ({
  focusRef,
}: {
  focusRef: React.MutableRefObject<((pos: [number, number]) => void) | null>
}) => {
  const map = useMap()
  useEffect(() => {
    // Memaksa Leaflet memperbarui ukuran peta saat dimensi container-nya berubah (panel muncul/sembunyi)
    map.invalidateSize()
  }, [map])

  useEffect(() => {
    focusRef.current = (pos) => map.flyTo(pos, 14, { duration: 1 })
    return () => { focusRef.current = null }
  }, [map, focusRef])
  return null
}

const FitOnce = ({ latlngs }: { latlngs: [number, number][] }) => {
  const map    = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (fitted.current || latlngs.length === 0) return
    fitted.current = true
    map.fitBounds(L.latLngBounds(latlngs), { padding: [60, 60], maxZoom: 13 })
  }, [latlngs, map])
  return null
}

// ─── Main ──────────────────────────────────────────────────
const TrackingPage = () => {
  const [search, setSearch]         = useState('')
  const [tileMode, setTileMode]     = useState<'street' | 'satellite'>('street')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Kontrol visibilitas panel kanan side-by-side
  const [showPanel, setShowPanel]   = useState(false)

  const focusRef = useRef<((pos: [number, number]) => void) | null>(null)
  const positions = DUMMY_POSITIONS

  const filtered = useMemo(
    () => positions.filter((p) =>
      p.equipment_code.toLowerCase().includes(search.toLowerCase()) ||
      p.equipment_alias.toLowerCase().includes(search.toLowerCase())
    ),
    [positions, search]
  )

  const latlngs = useMemo(
    () => positions.map((p) => [p.latitude, p.longitude] as [number, number]),
    [positions]
  )

  const handleSelect = useCallback((id: string, lat: number, lng: number) => {
    setSelectedId((prev) => prev === id ? null : id)
    focusRef.current?.([lat, lng])
  }, [])

  const tileUrl = tileMode === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  return (
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
          <Badge status="processing" text={
            <Text style={{ fontSize: 11, color: '#888' }}>Live</Text>
          } />
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
            icon={showPanel ? <CloseOutlined /> : <InfoOutlined />}
            style={{ fontSize: 12 }}
            onClick={() => setShowPanel((prev) => !prev)}
          >
            {showPanel ? 'CLOSE PANEL' : 'OPEN PANEL'}
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Bagian Peta (Sebelah Kiri) ── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

          {/* Tile toggle */}
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

            {positions.map((pos) => (
              <Marker
                key={pos.equipment_id}
                position={[pos.latitude, pos.longitude]}
                icon={createIcon(pos.movement_status, pos.heading, selectedId === pos.equipment_id)}
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
            <FitOnce latlngs={latlngs} />
          </MapContainer>
        </div>

        {/* ── Semua Panel di Sebelah Kanan (Hanya muncul saat showPanel = true) ── */}
        {showPanel && (
          <div style={{ display: 'flex', height: '100%', flexShrink: 0 }}>
            
            {/* 1. Sub-Panel Kiri Dalam: List Pencarian Equipment */}
            <div style={{
              width: 260,
              display: 'flex', flexDirection: 'column',
              background: '#fafafa',
              borderLeft: '1px solid #e8e8e8',
              borderRight: '1px solid #e8e8e8',
            }}>
              {/* Search */}
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

              {/* List Item */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filtered.length === 0
                  ? <div style={{ padding: 24 }}>
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<Text style={{ fontSize: 12 }}>Tidak ada data</Text>} />
                    </div>
                  : filtered.map((pos) => {
                      const color    = STATUS_COLOR[pos.movement_status] ?? '#999'
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
                          </div>
                        </div>
                      )
                    })
                }
              </div>
            </div>
            
            {/* 2. Sub-Panel Kanan Dalam: Dump Truck Status & Alerts */}
            <div style={{
              width: 300,
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden', background: '#fff',
            }}>

              {/* Dump Truck Status */}
              <div style={{
                flexShrink: 0,
                borderBottom: '1px solid #e8e8e8',
                maxHeight: '45%',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  padding: '9px 14px', fontSize: 12, fontWeight: 700,
                  letterSpacing: 0.5, color: '#333',
                  borderBottom: '1px solid #f0f0f0', textAlign: 'left',
                  flexShrink: 0,
                }}>
                  DUMP TRUCK STATUS
                </div>

                {/* Scrollable Status */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {/* Total */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '6px 14px',
                    borderBottom: '1px solid #f5f5f5',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ReloadOutlined style={{ fontSize: 13, color: '#888' }} />
                      <Text style={{ fontSize: 13 }}>{positions.length} Total</Text>
                    </div>
                  </div>

                  {/* Per Equipment Status */}
                  {positions.map((pos) => (
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
                            fill={STATUS_COLOR[pos.movement_status] ?? '#999'}
                            stroke="white" strokeWidth="2" />
                        </svg>
                        <div>
                          <Text style={{ fontSize: 11, color: '#888' }}>
                            {STATUS_LABEL[pos.movement_status]}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert Sections */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {ALERT_SECTIONS.map((section) => (
                  <div key={section.key} style={{ borderBottom: '1px solid #e8e8e8' }}>
                    {/* Header */}
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

                    {/* Table Header */}
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

                    {/* Empty Alert */}
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
  )
}

export default TrackingPage