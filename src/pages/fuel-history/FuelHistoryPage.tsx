import { useMemo, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button, Card, Select, Spin } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Marker, Tooltip, useMap } from 'react-leaflet'
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
import FuelHistoryChart from './components/FuelHistoryChart'
import FuelHistoryList from './components/FuelHistoryList'
import type { AlertDataPoint } from './components/FuelHistoryChart'
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

// Marker dengan icon berdasarkan status & vessel_status.
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
      <div><strong>Coordinat:</strong> {markerData.latitude.toFixed(6)}, {markerData.longitude.toFixed(6)}</div>
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
      <Tooltip direction="top" offset={[0, -18]}>
        {tooltipContent}
      </Tooltip>
    </Marker>
  )
}

const FlyToLogMarker = ({ lat, lng, trigger }: { lat: number; lng: number; trigger: number }) => {
  const map = useMap()
  useEffect(() => {
    if (lat !== 0 && lng !== 0) {
      map.flyTo([lat, lng], 17, { animate: true, duration: 0.5 })
    }
  }, [lat, lng, trigger])
  return null
}

const toShiftValue = (shift?: { shift_name?: string; sequence?: number }): string | undefined => {
  const parsed = shift?.shift_name?.match(/(\d+)\s*$/)?.[1]
  if (parsed) return parsed
  return shift?.sequence != null ? String(shift.sequence) : undefined
}

const minutesOfDay = (value: string): number => {
  const d = dayjs(value)
  return d.hour() * 60 + d.minute()
}

const getAlertStatus = (log: EquipmentLog): string | undefined => {
  const alert = log.alerts?.find((item) => typeof item?.status === 'string' && item.status.trim())
  const status = alert?.status?.trim()
  return status || undefined
}

const FuelHistoryPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialCode = searchParams.get('equipmentCode') ?? ''
  const initialDate = searchParams.get('date')
  const initialShift = searchParams.get('shift')

  const normalizedShift = initialShift
    ? initialShift.replace('Shift ', '')
    : undefined

  const [showPanel, setShowPanel] = useState(true)
  const [search, setSearch] = useState<string>(initialCode || '')

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

  const currentShift = useCurrentShift(project?.id, dayjs().format('HH:mm'))

  const selectedDate = useMemo(
    () =>
      dateOverride ??
      (currentShift.data ? getOperationalDate(dayjs(), currentShift.data) : dayjs()),
    [dateOverride, currentShift.data],
  )

  const shift = useMemo(
    () => shiftOverride ?? toShiftValue(currentShift.data) ?? '1',
    [shiftOverride, currentShift.data],
  )

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

  useEffect(() => {
    syncUrl(search, selectedDate, shift)
  }, [search, selectedDate, shift, syncUrl])

  const dateStr = selectedDate.format('YYYY-MM-DD')

  const { data: shiftList } = useShifts({ page: 1, limit: 100 })

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

  const filteredLogs = useMemo(() => {
    return equipmentLogsData?.data ?? []
  }, [equipmentLogsData])

  const orderedLogs = useMemo(() => {
    if (filteredLogs.length === 0) return filteredLogs

    const activeShift = shiftList?.data?.find((s) => toShiftValue(s) === shift)
    const startTime = activeShift?.start_time
    if (!startTime) return filteredLogs

    const startMinutes = Number(startTime.slice(0, 2)) * 60 + Number(startTime.slice(3, 5))
    if (!Number.isFinite(startMinutes)) return filteredLogs

    const anchorIndex = filteredLogs.findIndex(
      (log) => minutesOfDay(log.created_at) >= startMinutes,
    )
    if (anchorIndex <= 0) return filteredLogs

    return [...filteredLogs.slice(anchorIndex), ...filteredLogs.slice(0, anchorIndex)]
  }, [filteredLogs, shiftList, shift])

  const focusLog = useCallback(
    (log: EquipmentLog | undefined) => {
      if (!log) return
      const idx = orderedLogs.findIndex((l) => l.id === log.id)
      if (idx < 0) return
      setSelectedLogId(log.id)
      setFlyToIndex(idx)
      setFlyToTrigger((prev) => prev + 1)
    },
    [orderedLogs],
  )

  const chartData: AlertDataPoint[] = useMemo(() => {
    const logs = orderedLogs

    return logs.map((log) => {
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
  }, [orderedLogs])

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
        <PageHeader title="Fuel History" />

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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            minWidth: 0,
            gap: 16,
          }}
        >
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
          </Card>

          <FuelHistoryChart
            equipmentCode={search || 'No Asset Selected'}
            data={chartData}
            onClick={(dataIndex) => {
              focusLog(orderedLogs[dataIndex])
            }}
          />
        </div>

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
                onChange={setDateOverride}
              />
              <Select
                size="large"
                value={shift}
                loading={currentShift.isLoading}
                onChange={(val: string) => setShiftOverride(val)}
                options={[
                  { label: 'Shift 1', value: '1' },
                  { label: 'Shift 2', value: '2' },
                ]}
              />
            </div>

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
              <span>Fuel History</span>
              <span>{filteredLogs.length || 0}</span>
            </div>

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
              <FuelHistoryList
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

export default FuelHistoryPage
