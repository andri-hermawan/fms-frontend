import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, Empty, Select, Space, Spin } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { CircleMarker, Popup } from 'react-leaflet'
import dayjs from 'dayjs'

import PageHeader from '@/components/ui/PageHeader'
import CurrentDateDisplay from '@/components/ui/CurrentDateDisplay'
import { BaseMap, GeofenceLayer, MapController, MapResize } from '@/components/map'
import { formatDurationBetween, formatTime } from '@/utils/format'
import { useAuthStore } from '@/stores/auth.store'
import EquipmentSearch from '@/pages/tracking/components/EquipmentSearch'
import AlertSummary from './components/AlertSummary'
import alertApi from '@/services/api/alert.api'
import alertCategoryApi from '@/services/api/alert-category.api'
import type { Alert } from '@/types/alert.types'
import { getAlertCategoryColor } from '@/utils/alert-category'

// Dot marker untuk distribusi lokasi alert, warna mengikuti kategori.
const AlertDotMarker = ({ alert }: { alert: Alert }) => {
  const color =
    getAlertCategoryColor(
      alert.alert_categories?.alert_category_name ?? alert.status,
    ) ?? '#ff4d4f'

  return (
    <CircleMarker
      center={[alert.latitude, alert.longitude]}
      radius={6}
      pathOptions={{
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.85,
      }}
    >
      <Popup minWidth={200} autoPan closeButton>
        <div style={{ fontSize: 12, fontFamily: 'Segoe UI, sans-serif', color: '#333' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {alert.equipments?.equipment_code ?? alert.vessel}
          </div>
          <div>
            {alert.alert_categories?.alert_category_name ?? alert.status}
          </div>
          <div style={{ marginTop: 4 }}>
            Zone: {alert.segment} · Speed: {alert.speed} km/h
          </div>
        </div>
      </Popup>
    </CircleMarker>
  )
}

const DistributionMapPage = () => {
  const [showPanel, setShowPanel] = useState(true)
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [shift, setShift] = useState<string>('1')
  const [search, setSearch] = useState<string>()
  const [category, setCategory] = useState<string>()

  const project = useAuthStore((s) => s.project)
  const geoJson = project?.geojson_origin ?? null

  const dateStr = selectedDate.format('YYYY-MM-DD')

  // ─── Data Alert (kosong saat pertama load) ─────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['alerts', dateStr, category, search],
    queryFn: () => {
      const params = {
        page: 1,
        limit: 100,
        created_at: dateStr,
        created_at_end: dateStr,
        ...(category ? { alert_category_id: category } : {}),
        ...(search ? { search } : {}),
      }
      console.log('[DistributionMapPage] query params:', params)
      return alertApi.getAll(params).then((r) => {
        console.log(
          '[DistributionMapPage] response total:',
          r.data?.meta?.total,
          'data count:',
          r.data?.data?.length,
        )
        return r.data
      })
    },
  })

  const alerts = (data?.data ?? []).filter((alert) => {
    if (!search) return false
    const code = alert.equipments?.equipment_code ?? alert.vessel
    return code === search
  })

  // ─── Filter Alert Category ─────────────────────────────────
  const { data: categoriesData } = useQuery({
    queryKey: ['alert-categories'],
    queryFn: () => alertCategoryApi.getAll({ limit: 100 }).then((r) => r.data),
  })

  const categoryOptions = useMemo(
    () => [
      { label: 'All Alerts', value: '' },
      ...(categoriesData?.data ?? []).map((c) => ({
        label: c.alert_category_name,
        value: c.id,
      })),
    ],
    [categoriesData],
  )

  // const unreadCount = alerts.filter((a) => !a.is_read).length

  const equipmentOptions = useMemo(() => {
    const codes = new Set<string>()
    const allAlerts = data?.data ?? []
    allAlerts.forEach((a) => {
      const code = a.equipments?.equipment_code ?? a.vessel
      if (code) codes.add(code)
    })
    return Array.from(codes)
      .sort()
      .map((code) => ({ label: code, value: code }))
  }, [data])

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
        <PageHeader title="Distribution Map Monitoring" />

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
        {/* ── Left: Map ─────────────────────────────────────── */}
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
            <MapResize deps={showPanel} />
            <MapController />
            <GeofenceLayer geoJson={geoJson} />
            {alerts.map((alert) => (
              <AlertDotMarker key={alert.id} alert={alert} />
            ))}
          </BaseMap>
        </Card>

        {/* ── Right: Alert List Panel ──────────────────────── */}
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
              onChange={(code) => setSearch(code || undefined)}
            />
            <div style={{ display: 'flex', gap: 8 }}>
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
            <Select
              style={{ width: '100%' }}
              size="large"
              allowClear
              placeholder="Filter by Alert Category"
              value={category ?? ''}
              onChange={(v) => setCategory(v || undefined)}
              options={categoryOptions}
            />
          </div>

          {/* Alert summary */}
          <AlertSummary count={alerts.length} />

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
            }}
          >
            {alerts.length === 0 ? (
              <Empty description="No alert found" style={{ marginTop: 48 }} />
            ) : (
              <Space orientation="vertical" size={8} style={{ width: '100%' }}>
                {alerts.map((alert) => {
                  const rowColor =
                    getAlertCategoryColor(
                      alert.alert_categories?.alert_category_name ?? alert.status,
                    ) ?? '#fff'

                  return (
                    <div
                      key={alert.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #f0f0f0',
                        background: rowColor,
                        transition: 'background .2s',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#fff' }}>
                          {alert.equipments?.equipment_code ?? alert.vessel}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 12, color: '#fff' }}>
                          {alert.alert_categories?.alert_category_name ?? alert.status}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 4,
                          fontSize: 12,
                          color: 'rgba(255,255,255,0.92)',
                        }}
                      >
                        <span>Zone: {alert.segment}</span>
                        <span>Speed: {alert.speed} km/h</span>
                        <span>Start: {formatTime(alert.created_at)}</span>
                        <span>Stop: {formatTime(alert.resolved_at)}</span>
                        <span>
                          Duration: {formatDurationBetween(alert.created_at, alert.resolved_at)}
                        </span>
                        <span>Fuel: {alert.fuel_level}%</span>
                      </div>
                    </div>
                  )
                })}
              </Space>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default DistributionMapPage
