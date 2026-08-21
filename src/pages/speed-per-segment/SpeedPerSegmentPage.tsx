import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Select } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import dayjs from 'dayjs'

import PageHeader from '@/components/ui/PageHeader'
import CurrentDateDisplay from '@/components/ui/CurrentDateDisplay'
import { BaseMap, MapController, MapResize, MapLegendSpeed } from '@/components/map'
import SegmentTooltipLayer from './SegmentTooltipLayer'
import SpeedPerSegmentList from './components/SpeedPerSegmentList'
import { useAuthStore } from '@/stores/auth.store'
import { useEquipmentLogsByDateShift, useSegmentSpeedSummary } from '@/hooks/useEquipmentLogs'

const SpeedPerSegmentPage = () => {
  const navigate = useNavigate()

  const [showPanel, setShowPanel] = useState(true)
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
  const [shift, setShift] = useState<string | undefined>(undefined)

  const syncUrl = useCallback(
    (date?: dayjs.Dayjs | null, shiftVal?: string) => {
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

  const project = useAuthStore((s) => s.project)
  const geoJson = project?.geojson_origin ?? null

  const dateStr = selectedDate?.format('YYYY-MM-DD') ?? null
  const shiftLabel = shift === '1' ? 'Shift 1' : shift === '2' ? 'Shift 2' : null

  const logsParams = useMemo(() => {
    if (!dateStr || !shiftLabel) return null
    return { created_at: dateStr, shift: shiftLabel }
  }, [dateStr, shiftLabel])

  const { data: logsData } = useEquipmentLogsByDateShift(logsParams)
  const logs = logsData?.data ?? []

  const { data: speedSummaryData } = useSegmentSpeedSummary(logsParams)
  const speedData = speedSummaryData?.data ?? []

  // console.log('[SpeedPerSegmentPage] speedSummaryData:', speedSummaryData, 'speedData:', speedData)

  const defaultMapCenter = useMemo(() => [-3.487, 103.869] as [number, number], [])

  const getSpeedColor = (speed: number): string => {
    if (speed <= 10) return '#000000'
    if (speed <= 20) return '#FFA500'
    if (speed <= 30) return '#55FF00'
    if (speed <= 40) return '#00C8FF'
    if (speed <= 50) return '#0055FF'
    return '#FF0000'
  }

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
        <PageHeader title="Speed Per Segment" />

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
            <SegmentTooltipLayer geoJson={geoJson} speedData={speedData} />
            {logs.map((log) =>
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
              onChange={(date) => setSelectedDate(date)}
            />
            <Select
              value={shift}
              onChange={(val) => setShift(val)}
              allowClear
              placeholder="Pilih Shift"
              options={[
                { label: 'Shift 1', value: '1' },
                { label: 'Shift 2', value: '2' },
              ]}
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
            <span>Speed Per Segment</span>
            <span>{logs.length}</span>
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
            <SpeedPerSegmentList data={logs} />
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default SpeedPerSegmentPage
