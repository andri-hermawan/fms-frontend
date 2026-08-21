import { useMemo, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button, Card, Select, Spin } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Marker, useMap } from 'react-leaflet'
import dayjs from 'dayjs'

import PageHeader from '@/components/ui/PageHeader'
import CurrentDateDisplay from '@/components/ui/CurrentDateDisplay'
import { BaseMap, GeofenceLayer, MapController, MapResize, ResetViewButton } from '@/components/map'
import { useAuthStore } from '@/stores/auth.store'
import EquipmentSearch from '@/pages/tracking/components/EquipmentSearch'
import { useEquipmentLogsByDateShift } from '@/hooks/useEquipmentLogs'
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
  latitude: log.latitude ?? 0,
  longitude: log.longitude ?? 0,
  heading: log.heading ?? 0,
  speed: Number(log.speed) || 0,
  vessel_status: log.vessel_status ?? '',
  status: log.status ?? '',
  engine_status: log.engine_status ?? false,
  alert_count: log.alerts?.length ?? 0,
  fuel_level: Number(log.fuel_level) || 0,
  fuel_volume: Number(log.fuel_volume) || 0,
  fuel_percentage: Number(log.fuel_percentage) || 0,
  recorded_at: log.created_at,
})

// Marker dengan icon berdasarkan status & vessel_status (seperti TrackingPage)
const LogMarker = ({ log }: { log: EquipmentLog }) => {
  const markerData = toMarkerData(log)
  if (markerData.latitude === 0 && markerData.longitude === 0) return null

  return (
    <Marker
      position={[markerData.latitude, markerData.longitude]}
      icon={getMarkerIcon(markerData)}
    />
  )
}

// FlyTo komponen: pindahkan map ke koordinat tertentu saat trigger berubah
const FlyToLogMarker = ({ lat, lng, trigger }: { lat: number; lng: number; trigger: number }) => {
  const map = useMap()
  useEffect(() => {
    if (lat !== 0 && lng !== 0) {
      map.flyTo([lat, lng], 17, { animate: true, duration: 0.5 })
    }
  }, [lat, lng, trigger])
  return null
}

const PositionHistoryPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialCode = searchParams.get('equipmentCode') ?? ''
  const initialDate = searchParams.get('date')
  const initialShift = searchParams.get('shift') ?? '1'

  // Normalize: URL param bisa 'Shift 1' / 'Shift 2' atau '1' / '2'
  const normalizedShift = initialShift === 'Shift 1' || initialShift === 'Shift 2'
    ? initialShift.replace('Shift ', '')
    : initialShift

  const [showPanel, setShowPanel] = useState(true)
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(
    initialDate && dayjs(initialDate).isValid() ? dayjs(initialDate) : dayjs(),
  )
  const [shift, setShift] = useState<string>(normalizedShift)
  const [search, setSearch] = useState<string>(initialCode || '')
  const [flyToIndex, setFlyToIndex] = useState<number>(0)
  const [flyToTrigger, setFlyToTrigger] = useState<number>(0)

  const defaultMapCenter = useMemo(() => [-3.585, 103.809] as [number, number], [])

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

  const project = useAuthStore((s) => s.project)
  const geoJson = project?.geojson_origin ?? null

  const dateStr = selectedDate.format('YYYY-MM-DD')

  // ─── Data Equipment Logs (chart + map + list) ──────────────
  const shiftLabel = shift === '1' ? 'Shift 1' : 'Shift 2'

  const equipmentLogsParams = useMemo(() => {
    if (!dateStr) return null
    return { created_at: dateStr, shift: shiftLabel }
  }, [dateStr, shiftLabel])

  const { data: logsData, isLoading } = useEquipmentLogsByDateShift(equipmentLogsParams)

  // Filter logs by selected equipment code
  const filteredLogs = useMemo(() => {
    const logs = logsData?.data ?? []
    if (!search) return []
    return logs.filter((log) => log.equipment_code === search)
  }, [logsData, search])

  const chartData: AlertDataPoint[] = useMemo(() => {
    const logs = filteredLogs

    const result = logs.map((log) => {
      const speed = Number(log.speed) || 0
      const fuel = Number(log.fuel_percentage) || 0
      const alertStatus = log.alerts?.[0]?.status || log.status || undefined
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
    console.log('[PositionHistoryPage] chartData sample:', result.slice(0, 3).map(d => ({ time: d.time, alertStatus: d.alertStatus })))
    return result
  }, [filteredLogs])

  // ─── Equipment Options (dari logsData) ─────────────────

  const equipmentOptions = useMemo(() => {
    const codes = new Set<string>()
    const logs = logsData?.data ?? []
    logs.forEach((log) => {
      const code = log.equipment_code ?? log.vessel
      if (code) codes.add(code)
    })
    return Array.from(codes)
      .sort()
      .map((code) => ({ label: code, value: code }))
  }, [logsData])

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
            {isLoading && (
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
              <FlyToLogMarker
                lat={Number(filteredLogs[flyToIndex]?.latitude ?? 0)}
                lng={Number(filteredLogs[flyToIndex]?.longitude ?? 0)}
                trigger={flyToTrigger}
              />
              {filteredLogs.map((log) => (
                <LogMarker key={log.id} log={log} />
              ))}
            </BaseMap>
          </Card>

          {/* Chart */}
          <PositionHistoryChart
            equipmentCode={search || 'No Equipment Selected'}
            data={chartData}
            onClick={(dataIndex) => {
              setFlyToIndex(dataIndex)
              setFlyToTrigger((prev) => prev + 1)
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
              onChange={(code) => setSearch(code ?? '')}
            />
            <CurrentDateDisplay
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
            />
            <Select
              size="large"
              value={shift}
              onChange={setShift}
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
            <PositionHistoryList data={filteredLogs} />
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default PositionHistoryPage
