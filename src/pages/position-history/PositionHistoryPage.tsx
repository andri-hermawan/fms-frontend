import { useMemo, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button, Card, Select, Spin } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Marker, Polyline, Tooltip, useMap } from 'react-leaflet'
import dayjs from 'dayjs'
import L from 'leaflet'

import PageHeader from '@/components/ui/PageHeader'
import CurrentDateDisplay from '@/components/ui/CurrentDateDisplay'
import { BaseMap, GeofenceLayer, MapController, MapResize, ResetViewButton } from '@/components/map'
import { useAuthStore } from '@/stores/auth.store'
import { useCurrentShift, useShifts } from '@/pages/master/shift/useShift'
import { getOperationalDate } from '@/utils/operational-date'
import EquipmentSearch from '@/pages/tracking/components/EquipmentSearch'
import useEquipmentLogs, { useEquipmentLogsByDateShift } from '@/hooks/useEquipmentLogs'
import PositionHistoryChart from './components/PositionHistoryChart'
import PositionHistoryList from './components/PositionHistoryList'
import type { AlertDataPoint } from './components/PositionHistoryChart'
import type { EquipmentLog } from '@/types/equipment-logs.types'
import type { EquipmentMarkerData } from '@/types/map.types'
import { getMarkerIcon } from '@/utils/marker-icon'



// Convert EquipmentLog ke EquipmentMarkerData untuk getMarkerIcon
const toMarkerData = (log: EquipmentLog): EquipmentMarkerData => ({
  equipment_id: log.equipment_id,
  equipment_code: log.equipment_code ?? '-',
  operator_name: '',
  segment: log.segment ?? '',
  latitude: log.latitude ?? 0,
  longitude: log.longitude ?? 0,
  heading: log.heading ?? 0,
  speed: Number(log.speed) || 0,
  vessel_status: log.vessel_status ?? '',
  vessel: Number(log.vessel) || 0,
  status: log.status ?? '',
  gsm_signal: log.gsm_signal ?? 0,
  breakdown: false,
  engine_status: log.engine_status ?? false,
  alert_count: log.alerts?.length ?? 0,
  fuel_level: Number(log.fuel_level) || 0,
  fuel_volume: Number(log.fuel_volume) || 0,
  fuel_percentage: Number(log.fuel_percentage) || 0,
  recorded_at: log.created_at,
})

// Marker dengan icon berdasarkan status & vessel_status (seperti TrackingPage).
// Bila `selected` true, marker diberi lingkaran pulse supaya mudah dikenali
// di antara banyak titik yang tumpang tindih.
const LogMarker = ({ log, selected = false }: { log: EquipmentLog; selected?: boolean }) => {
  const markerData = toMarkerData(log)
  if (markerData.latitude === 0 && markerData.longitude === 0) return null

  const tooltipContent = (
    <div style={{ minWidth: 250, lineHeight: 1.6 }}>
      <div><strong>{markerData.equipment_code}</strong> </div>
      <div>
        <strong>Jam:</strong> {dayjs(log.created_at).format('HH:mm')}
        {' - '}
        <strong>Speed:</strong> {markerData.speed.toFixed(2)}
        {' - '}
        <strong>Fuel:</strong> {markerData.fuel_percentage.toFixed(0)}%
      </div>
      <div><strong>MapSegment:</strong> {markerData.segment || '-'}</div>
      <div>
        <strong>Coordinat:</strong>{' '}
        <a
          href={`https://www.google.com/maps?q=${markerData.latitude},${markerData.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#1677ff', textDecoration: 'none', cursor: 'pointer' }}
        >
          {markerData.latitude.toFixed(6)}, {markerData.longitude.toFixed(6)}
        </a>
      </div>
    </div>
  )

  if (selected) {
    const baseIcon = getMarkerIcon(markerData)
    const url = baseIcon.options.iconUrl as string
    const html = `
      <div class="position-history-selected-marker">
        <span class="pulse-ring"></span>
        <img src="${url}" alt="" />
      </div>`
    return (
      <Marker
        position={[markerData.latitude, markerData.longitude]}
        icon={L.divIcon({
          html,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })}
        zIndexOffset={1000}
      >
        <Tooltip
          direction="top"
          offset={[0, -18]}
          opacity={1}
          permanent
          interactive
        >
          {tooltipContent}
        </Tooltip>
      </Marker>
    )
  }

  return (
    <Marker
      position={[markerData.latitude, markerData.longitude]}
      icon={getMarkerIcon(markerData)}
    >
      <Tooltip direction="top" offset={[0, -18]} interactive>
        {tooltipContent}
      </Tooltip>
    </Marker>
  )
}

// FlyTo komponen: pindahkan map ke koordinat tertentu saat trigger berubah
const FlyToLogMarker = ({ lat, lng, trigger }: { lat: number; lng: number; trigger: number }) => {
  const map = useMap()
  useEffect(() => {
    if (lat !== 0 && lng !== 0) {
      map.flyTo([lat, lng], 17, { animate: true, duration: 0.5 })
    }
  }, [lat, lng, map, trigger])
  return null
}

// Ambil nomor shift dari nama shift API ("Shift 1" -> "1"), fallback ke sequence
const toShiftValue = (shift?: { shift_name?: string; sequence?: number }): string | undefined => {
  const parsed = shift?.shift_name?.match(/(\d+)\s*$/)?.[1]
  if (parsed) return parsed
  return shift?.sequence != null ? String(shift.sequence) : undefined
}

// Menit dalam satu hari (0-1439) dari timestamp ISO, untuk urutkan jam mengikuti shift
const minutesOfDay = (value: string): number => {
  const d = dayjs(value)
  return d.hour() * 60 + d.minute()
}

const getAlertStatus = (log: EquipmentLog): string | undefined => {
  const alert = log.alerts?.find((item) => typeof item?.status === 'string' && item.status.trim())
  const status = alert?.status?.trim()
  return status || undefined
}

const PositionHistoryPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialCode = searchParams.get('equipmentCode') ?? ''
  const initialDate = searchParams.get('date')
  const initialShift = searchParams.get('shift')

  // Normalize: URL param bisa 'Shift 1' / 'Shift 2' atau '1' / '2'
  const normalizedShift = initialShift
    ? initialShift.replace('Shift ', '')
    : undefined

  const [showPanel, setShowPanel] = useState(true)
  const [search, setSearch] = useState<string>(initialCode || '')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackIndex, setPlaybackIndex] = useState(0)

  // Override hanya terisi saat user mengubah filter (atau dari deep-link URL).
  // Selama null, nilai dipakai dari default operasional (current shift).
  const [dateOverride, setDateOverride] = useState<dayjs.Dayjs | null>(
    initialDate && dayjs(initialDate).isValid() ? dayjs(initialDate) : null,
  )
  const [shiftOverride, setShiftOverride] = useState<string | null>(
    normalizedShift ?? null,
  )
  const [flyToIndex, setFlyToIndex] = useState<number>(0)
  const [flyToTrigger, setFlyToTrigger] = useState<number>(0)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)

  const defaultMapCenter = useMemo(() => [-3.585, 103.809] as [number, number], [])

  const project = useAuthStore((s) => s.project)
  const geoJson = project?.geojson_origin ?? null

  // ─── Current shift (sumber default tanggal & shift operasional) ──
  const currentShift = useCurrentShift(project?.id, dayjs().format('HH:mm'))

  // Tanggal efektif: override user bila ada, selain itu tanggal operasional
  // (mundur 1 hari bila shift malam sudah lewat tengah malam).
  const selectedDate = useMemo(
    () =>
      dateOverride ??
      (currentShift.data ? getOperationalDate(dayjs(), currentShift.data) : dayjs()),
    [dateOverride, currentShift.data],
  )

  // Shift efektif: override user bila ada, selain itu shift yang sedang berjalan.
  const shift = useMemo(
    () => shiftOverride ?? toShiftValue(currentShift.data) ?? '1',
    [shiftOverride, currentShift.data],
  )

  // Sync URL params when filter changes
  const syncUrl = useCallback(
    (code?: string, date?: dayjs.Dayjs, shiftVal?: string) => {
      const params = new URLSearchParams()
      if (code) params.set('equipmentCode', code)
      if (date) params.set('date', date.format('YYYY-MM-DD'))
      if (shiftVal) params.set('shift', `Shift ${shiftVal}`)
      navigate(`?${params.toString()}`, { replace: true })
    },
    [navigate],
  )

  // Sync URL on filter changes
  useEffect(() => {
    syncUrl(search, selectedDate, shift)
  }, [search, selectedDate, shift, syncUrl])

  const dateStr = selectedDate.format('YYYY-MM-DD')

  // ─── Data Shift (untuk ketahui start_time agar urutan jam benar) ──
  const { data: shiftList } = useShifts({ page: 1, limit: 100 })

  // ─── Data Equipment Logs (chart + map + list) ──────────────
  const shiftLabel = `Shift ${shift}`

  const equipmentLogsParams = useMemo(() => {
    if (!dateStr || !search) return null
    return {
      created_at: dateStr,
      equipment_code: search,
      shift: shiftLabel,
    }
  }, [dateStr, search, shiftLabel])

  const { data: equipmentLogsData, isLoading: isEquipmentLogsLoading } = useEquipmentLogs(equipmentLogsParams)

  const allLogsParams = useMemo(() => {
    if (!dateStr) return null
    return { created_at: dateStr, shift: shiftLabel }
  }, [dateStr, shiftLabel])
  const { data: allLogsData } = useEquipmentLogsByDateShift(allLogsParams)

  // Filter logs by selected equipment code
  const filteredLogs = useMemo(() => {
    return equipmentLogsData?.data ?? []
  }, [equipmentLogsData])

  // Urutkan log mengikuti start_time shift, bukan urutan ascending API.
  // Contoh Shift 2 (start 19:00): 19,20,...,23,00,01,...,06
  const orderedLogs = useMemo(() => {
    if (filteredLogs.length === 0) return filteredLogs

    // Cari start_time shift yang aktif (session/override), fallback ke 0
    const activeShift = shiftList?.data?.find((s) => toShiftValue(s) === shift)
    const startTime = activeShift?.start_time
    if (!startTime) return filteredLogs

    const startMinutes =
      Number(startTime.slice(0, 2)) * 60 + Number(startTime.slice(3, 5))
    if (!Number.isFinite(startMinutes)) return filteredLogs

    // Cari log pertama dengan waktu >= start_time sebagai titik awal urutan
    const anchorIndex = filteredLogs.findIndex(
      (log) => minutesOfDay(log.created_at) >= startMinutes,
    )
    if (anchorIndex <= 0) return filteredLogs

    return [...filteredLogs.slice(anchorIndex), ...filteredLogs.slice(0, anchorIndex)]
  }, [filteredLogs, shiftList, shift])

  const routePoints = useMemo(
    () =>
      orderedLogs.flatMap((log, index) => {
        const latitude = Number(log.latitude)
        const longitude = Number(log.longitude)
        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          (latitude === 0 && longitude === 0)
        ) {
          return []
        }
        return [{ index, position: [latitude, longitude] as [number, number] }]
      }),
    [orderedLogs],
  )
  const routePositions = routePoints.map((point) => point.position)
  const completedRoutePositions = routePoints
    .filter((point) => point.index <= playbackIndex)
    .map((point) => point.position)
  const currentPlaybackLog = orderedLogs[playbackIndex]

  const resetPlaybackForFilter = () => {
    setIsPlaying(false)
    setPlaybackIndex(0)
    setSelectedLogId(null)
  }

  useEffect(() => {
    if (!isPlaying || orderedLogs.length === 0) return

    const timer = window.setTimeout(() => {
      if (playbackIndex >= orderedLogs.length - 1) {
        setIsPlaying(false)
        return
      }

      const nextIndex = playbackIndex + 1
      const nextLog = orderedLogs[nextIndex]
      setPlaybackIndex(nextIndex)
      setSelectedLogId(nextLog.id)
      setFlyToIndex(nextIndex)
      setFlyToTrigger((previous) => previous + 1)
      if (nextIndex === orderedLogs.length - 1) setIsPlaying(false)
    }, 850)

    return () => window.clearTimeout(timer)
  }, [isPlaying, orderedLogs, playbackIndex])

  useEffect(() => {
    console.log(
      'alert logs',
      filteredLogs.filter((log) => log.alerts?.length > 0),
    )
  }, [filteredLogs])

  // Pindahkan map ke log terpilih & tandai marker-nya sebagai terpilih.
  const focusLog = (log: EquipmentLog | undefined) => {
    if (!log) return
    const idx = orderedLogs.findIndex((l) => l.id === log.id)
    if (idx < 0) return
    setIsPlaying(false)
    setPlaybackIndex(idx)
    setSelectedLogId(log.id)
    setFlyToIndex(idx)
    setFlyToTrigger((prev) => prev + 1)
  }

  const chartData: AlertDataPoint[] = useMemo(() => {
    const logs = orderedLogs

    const result = logs.map((log) => {
      const speed = Number(log.speed) || 0
      const fuel = Number(log.fuel_percentage) || 0
      const alertStatus = getAlertStatus(log)
      return {
        time: dayjs(log.created_at).format('HH:mm'),
        speed,
        fuel,
        speedMin: speed,
        speedMax: speed,
        fuelMin: fuel,
        fuelMax: fuel,
        count: 1,
        alertStatus,
      }
    })
    // console.log('[PositionHistoryPage] chartData sample:', result.slice(0, 3).map(d => ({ time: d.time, alertStatus: d.alertStatus })))
    return result
  }, [orderedLogs])

  // ─── Equipment Options (dari seluruh log tanggal dan shift) ──

  const equipmentOptions = useMemo(() => {
    const codes = new Set<string>()
    const logs = allLogsData?.data ?? []
    logs.forEach((log) => {
      const code = log.equipment_code ?? log.vessel
      if (code) codes.add(code)
    })
    return Array.from(codes)
      .sort()
      .map((code) => ({ label: code, value: code }))
  }, [allLogsData])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          flexShrink: 0,
          paddingBottom: 16,
        }}
      >
        <PageHeader title="Position History" />

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={showPanel ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setShowPanel(!showPanel)}
          >
            {showPanel ? 'Hide Panel' : 'Show Panel'}
          </Button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showPanel
            ? 'minmax(0, 3fr) minmax(0, 1fr)'
            : '1fr',
          gap: 16,
          flex: 1,
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {/* ── Left: Map + Chart (75%) ──────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            minWidth: 0,
            gap: 16,
          }}
        >
          {/* Map */}
          <Card
            style={{
              overflow: 'hidden',
              position: 'relative',
              minWidth: 0,
              flex: '1 1 0%',
              minHeight: 0,
              border: '1px solid #064596',
              borderRadius: 8,
            }}
            styles={{ body: { padding: 0, height: '100%' } }}
          >
            {isEquipmentLogsLoading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 9999,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,.75)',
                }}
              >
                <Spin size="large" description="Loading map..." />
              </div>
            )}

            <BaseMap>
            <MapController defaultCenter={defaultMapCenter} defaultZoom={10} />
              <MapResize deps={showPanel} />
              <GeofenceLayer geoJson={geoJson} />
              <ResetViewButton />
              {routePositions.length > 1 && (
                <Polyline
                  positions={routePositions}
                  pathOptions={{ color: '#64748b', weight: 4, opacity: 0.65 }}
                />
              )}
              {completedRoutePositions.length > 1 && (
                <Polyline
                  positions={completedRoutePositions}
                  pathOptions={{ color: '#1677ff', weight: 5, opacity: 0.9 }}
                />
              )}
              <FlyToLogMarker
                lat={Number(orderedLogs[flyToIndex]?.latitude ?? 0)}
                lng={Number(orderedLogs[flyToIndex]?.longitude ?? 0)}
                trigger={flyToTrigger}
              />
              {orderedLogs.map((log) => (
                <LogMarker
                  key={`${log.id}-${log.id === selectedLogId ? 'selected' : 'default'}`}
                  log={log}
                  selected={log.id === selectedLogId}
                />
              ))}
            </BaseMap>
            <div
              style={{
                position: 'absolute',
                left: 12,
                bottom: 12,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: 'min(440px, calc(100% - 24px))',
                padding: '8px 10px',
                border: '1px solid #d9e2ef',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.96)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <Button
                type="primary"
                size="small"
                icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
                disabled={orderedLogs.length === 0}
                onClick={() => {
                  if (isPlaying) {
                    setIsPlaying(false)
                    return
                  }
                  const startIndex =
                    playbackIndex >= orderedLogs.length - 1 ? 0 : playbackIndex
                  focusLog(orderedLogs[startIndex])
                  setIsPlaying(true)
                }}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                disabled={orderedLogs.length === 0}
                onClick={() => {
                  setIsPlaying(false)
                  focusLog(orderedLogs[0])
                }}
              >
                Reset
              </Button>
              <span style={{ minWidth: 42, fontSize: 12, color: '#64748b' }}>
                {currentPlaybackLog ? dayjs(currentPlaybackLog.created_at).format('HH:mm') : '--:--'}
              </span>
              <input
                aria-label="Playback timeline"
                type="range"
                min={0}
                max={Math.max(orderedLogs.length - 1, 0)}
                value={Math.min(playbackIndex, Math.max(orderedLogs.length - 1, 0))}
                disabled={orderedLogs.length === 0}
                onChange={(event) => {
                  const index = Number(event.target.value)
                  focusLog(orderedLogs[index])
                }}
                style={{ flex: 1, minWidth: 32, accentColor: '#1677ff', cursor: 'pointer' }}
              />
            </div>
          </Card>

          {/* Chart */}
          <PositionHistoryChart
            equipmentCode={search || 'No Asset Selected'}
            data={chartData}
            onClick={(dataIndex) => {
              focusLog(orderedLogs[dataIndex])
            }}
          />
        </div>

        {/* ── Right: Filters + Alert List (25%) ────────────── */}
        {showPanel && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {/* Filters — compact */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginBottom: 12,
              flexShrink: 0,
            }}
          >
            <EquipmentSearch
              value={search}
              options={equipmentOptions}
              onChange={(code) => {
                resetPlaybackForFilter()
                setSearch(code ?? '')
              }}
            />
            <CurrentDateDisplay
              value={selectedDate}
              onChange={(date) => {
                resetPlaybackForFilter()
                setDateOverride(date)
              }}
            />
            <Select
              size="large"
              value={shift}
              loading={currentShift.isLoading}
              onChange={(val: string) => {
                resetPlaybackForFilter()
                setShiftOverride(val)
              }}
              options={[
                { label: 'Shift 1', value: '1' },
                { label: 'Shift 2', value: '2' },
              ]}
            />
          </div>

          {/* Position History List */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              flexShrink: 0,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.4,
              background: '#064596',
              color: '#fff',
              borderRadius: 8,
            }}
          >
            <span>Position History</span>
            <span>{filteredLogs.length || 0}</span>
          </div>

          {/* Alert list */}
          <div
            style={{
              flex: '1 1 0%',
              minHeight: 0,
              minWidth: 0,
              overflowY: 'auto',
              border: '1px solid #e5e5e5',
              borderRadius: 8,
              padding: 8,
              marginTop: 8,
            }}
          >
            <PositionHistoryList
              data={orderedLogs}
              selectedId={selectedLogId}
              onSelect={focusLog}
            />
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default PositionHistoryPage
