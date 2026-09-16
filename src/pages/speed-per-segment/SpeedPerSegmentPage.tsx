import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Select } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import dayjs from 'dayjs'

import PageHeader from '@/components/ui/PageHeader'
import CurrentDateDisplay from '@/components/ui/CurrentDateDisplay'
import { BaseMap, MapController, MapResize, MapLegendSpeed, ResetViewButton } from '@/components/map'
import SegmentTooltipLayer from './SegmentTooltipLayer'
import SpeedPerSegmentList from './components/SpeedPerSegmentList'
import SegmentTooltipControl from './components/SegmentTooltipControl'
import { useAuthStore } from '@/stores/auth.store'
import { useCurrentShift } from '@/pages/master/shift/useShift'
import { getOperationalDate } from '@/utils/operational-date'
import { useEquipmentLogsByDateShift, useSegmentSpeedSummary } from '@/hooks/useEquipmentLogs'
import { getSpeedColor, getSpeedBand, SPEED_COLOR_BANDS } from '@/utils/speed-color'

// Ambil nomor shift dari nama shift API ("Shift 1" -> "1"), fallback ke sequence
const toShiftValue = (shift?: { shift_name?: string; sequence?: number }): string | undefined => {
  const parsed = shift?.shift_name?.match(/(\d+)\s*$/)?.[1]
  if (parsed) return parsed
  return shift?.sequence != null ? String(shift.sequence) : undefined
}

const SpeedPerSegmentPage = () => {
  const navigate = useNavigate()

  const [showPanel, setShowPanel] = useState(true)

  // Override hanya terisi saat user mengubah filter.
  // Selama null, nilai dipakai dari default operasional (current shift).
  const [dateOverride, setDateOverride] = useState<dayjs.Dayjs | null>(null)
  const [shiftOverride, setShiftOverride] = useState<string | null>(null)
  const [speedFilter, setSpeedFilter] = useState<string | undefined>(undefined)
  const [showAllLabels, setShowAllLabels] = useState(false)

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
    (date?: dayjs.Dayjs, shiftVal?: string) => {
      const params = new URLSearchParams()
      if (date) params.set('date', date.format('YYYY-MM-DD'))
      if (shiftVal) params.set('shift', `Shift ${shiftVal}`)
      navigate(`?${params.toString()}`, { replace: true })
    },
    [navigate],
  )

  useEffect(() => {
    syncUrl(selectedDate, shift)
  }, [selectedDate, shift, syncUrl])

  const dateStr = selectedDate.format('YYYY-MM-DD')
  const shiftLabel = `Shift ${shift}`

  const logsParams = useMemo(() => {
    if (!dateStr || !shiftLabel) return null
    return { created_at: dateStr, shift: shiftLabel }
  }, [dateStr, shiftLabel])

  const { data: logsData } = useEquipmentLogsByDateShift(logsParams)
  const logs = useMemo(() => logsData?.data ?? [], [logsData])
  // console.log("logs:", logs)
  const { data: speedSummaryData } = useSegmentSpeedSummary(logsParams)
  const speedData = speedSummaryData?.data ?? []

  const filteredLogs = useMemo(() => {
    if (!speedFilter) return logs
    return logs.filter(
      (log) => getSpeedBand(Number(log.speed) || 0).label === speedFilter,
    )
  }, [logs, speedFilter])

  const speedFilterOptions = useMemo(
    () => [
      { value: '', label: 'All Speeds' },
      ...SPEED_COLOR_BANDS.map((band) => ({
        value: band.label,
        label: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: band.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {band.label}
          </span>
        ),
      })),
    ],
    [],
  )

  // console.log('[SpeedPerSegmentPage] speedSummaryData:', speedSummaryData, 'speedData:', speedData)

  const defaultMapCenter = useMemo(() => [-3.487, 103.869] as [number, number], [])

  const getSpeedIcon = (speed: number) =>
    L.divIcon({
      className: '',
      html: `<div style="width:12px;height:12px;background:${getSpeedColor(speed)};border-radius:50%;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })

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
        <PageHeader title="Speed Heatmap" />

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
        {/* ── Map ─────────────────────────────────────────── */}
        <Card
          style={{
            overflow: 'hidden',
            position: 'relative',
            minWidth: 0,
            minHeight: 0,
            border: '1px solid #064596',
            borderRadius: 8,
          }}
          styles={{ body: { padding: 0, height: '100%' } }}
        >
          <BaseMap>
            <MapController defaultCenter={defaultMapCenter} defaultZoom={14} />
            <MapResize deps={showPanel} />
            <ResetViewButton />
            <SegmentTooltipLayer
              geoJson={geoJson}
              speedData={speedData}
              showAllLabels={showAllLabels}
            />
            <SegmentTooltipControl
              enabled={showAllLabels}
              onChange={setShowAllLabels}
            />
            {filteredLogs.map((log) =>
              log.latitude && log.longitude ? (
                <Marker
                  key={log.id}
                  position={[log.latitude, log.longitude]}
                  icon={getSpeedIcon(Number(log.speed) || 0)}
                />
              ) : null,
            )}
            <MapLegendSpeed />
          </BaseMap>
        </Card>

        {/* ── Right: Filters ──────────────────────────────── */}
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
            <CurrentDateDisplay
              value={selectedDate}
              onChange={setDateOverride}
            />
            <Select
              value={shift}
              loading={currentShift.isLoading}
              onChange={(val: string) => setShiftOverride(val)}
              options={[
                { label: 'Shift 1', value: '1' },
                { label: 'Shift 2', value: '2' },
              ]}
              style={{ width: '100%' }}
              size="large"
            />
            <Select
              value={speedFilter ?? ''}
              onChange={(val) => setSpeedFilter(val || undefined)}
              allowClear
              placeholder="Filter Kecepatan"
              options={speedFilterOptions}
              style={{ width: '100%' }}
              size="large"
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
            <span>Speed Heatmap List</span>
            <span>{filteredLogs.length}</span>
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
            <SpeedPerSegmentList data={filteredLogs} />
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default SpeedPerSegmentPage
