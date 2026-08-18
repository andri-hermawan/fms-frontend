import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button, Card, Select } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import PageHeader from '@/components/ui/PageHeader'
import CurrentDateDisplay from '@/components/ui/CurrentDateDisplay'
import { BaseMap, MapController, MapResize } from '@/components/map'
import SegmentTooltipLayer from './SegmentTooltipLayer'
import SpeedPerSegmentList from './components/SpeedPerSegmentList'
import { useAuthStore } from '@/stores/auth.store'

const SpeedPerSegmentPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialDate = searchParams.get('date')
  const initialShift = searchParams.get('shift') ?? '1'

  const normalizedShift = initialShift === 'Shift 1' || initialShift === 'Shift 2'
    ? initialShift.replace('Shift ', '')
    : initialShift

  const [showPanel, setShowPanel] = useState(true)
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(
    initialDate && dayjs(initialDate).isValid() ? dayjs(initialDate) : dayjs(),
  )
  const [shift, setShift] = useState<string>(normalizedShift)

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

  const project = useAuthStore((s) => s.project)
  const geoJson = project?.geojson_origin ?? null
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
            <MapController defaultCenter={[-3.487, 103.869]} defaultZoom={14} />
            <MapResize deps={showPanel} />
            <SegmentTooltipLayer geoJson={geoJson} />
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
              onChange={(date) => date && setSelectedDate(date)}
            />
            <Select
              value={shift}
              onChange={(val) => setShift(val)}
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
            <span>0</span>
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
            <SpeedPerSegmentList data={[]} />
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default SpeedPerSegmentPage
