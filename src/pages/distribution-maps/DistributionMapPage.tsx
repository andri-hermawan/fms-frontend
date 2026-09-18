import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, Select, Spin } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { CircleMarker, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import dayjs from 'dayjs'

import PageHeader from '@/components/ui/PageHeader'
import CurrentDateDisplay from '@/components/ui/CurrentDateDisplay'
import { BaseMap, GeofenceLayer, MapController, MapResize, ResetViewButton } from '@/components/map'
import { useAuthStore } from '@/stores/auth.store'
import { useCurrentShift } from '@/pages/master/shift/useShift'
import { getOperationalDate } from '@/utils/operational-date'
import EquipmentSearch from '@/pages/tracking/components/EquipmentSearch'
import AlertSummary from './components/AlertSummary'
import DistributionAlertList from './components/DistributionAlertList'
import alertApi from '@/services/api/alert.api'
import alertCategoryApi from '@/services/api/alert-category.api'
import type { Alert } from '@/types/alert.types'
import { getAlertCategoryColor } from '@/utils/alert-category'

// Isi popup marker, dipakai baik oleh dot biasa maupun marker terpilih.
const AlertPopupContent = ({ alert }: { alert: Alert }) => (

    <div style={{ minWidth: 250, lineHeight: 1.6 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 2,
        }}
      >
        <strong>{alert.equipments?.equipment_code}</strong>
        <strong>{alert.alert_categories?.alert_category_name ?? alert.status}</strong>
      </div>
      <div>
        <strong>Jam:</strong> {dayjs(alert.created_at).format('HH:mm')}
        {' - '}
        <strong>Speed:</strong> {alert.speed}
        {' - '}
        <strong>Fuel:</strong> {alert.fuel_percentage}%
      </div>
      <div><strong>Map Segment:</strong> {alert.segment || '-'}</div>
      <div><strong>Coordinat:</strong> {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}</div>
    </div>
)

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
        <AlertPopupContent alert={alert} />
      </Popup>
    </CircleMarker>
  )
}

// Marker terpilih: dot berkedip (animasi pulse) + popup otomatis terbuka.
// `trigger` ikut berubah tiap kali list diklik agar popup tetap terbuka
// walau alert yang sama dipilih ulang setelah popup ditutup manual.
const SelectedAlertMarker = ({ alert, trigger }: { alert: Alert; trigger: number }) => {
  const color =
    getAlertCategoryColor(
      alert.alert_categories?.alert_category_name ?? alert.status,
    ) ?? '#ff4d4f'
  const markerRef = useRef<L.Marker>(null)

  // Buka popup otomatis setiap kali marker terpilih berubah.
  // Harus lewat `marker.openPopup()`: popup yang di-bind ke marker belum punya
  // latlng sendiri, jadi memanggil map.openPopup() langsung bikin Leaflet
  // gagal memproyeksi posisi (error reading 'lat').
  useEffect(() => {
    markerRef.current?.openPopup()
  }, [alert.id, trigger])

  return (
    <Marker
      ref={markerRef}
      position={[alert.latitude, alert.longitude]}
      zIndexOffset={1000}
      icon={L.divIcon({
        className: '',
        html: `<div class="map-pulse-marker" style="--pulse-color:${color}"><span class="pulse-ring"></span><span class="pulse-dot"></span></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      })}
    >
      <Popup minWidth={200} autoPan={false} closeButton>
        <AlertPopupContent alert={alert} />
      </Popup>
      <Tooltip direction="top" offset={[0, -20]}>
        {alert.equipments?.equipment_code ?? alert.vessel ?? '-'}
      </Tooltip>
    </Marker>
  )
}

// FlyTo komponen: pindahkan map ke koordinat tertentu saat trigger berubah
const FlyToAlert = ({ lat, lng, trigger }: { lat: number; lng: number; trigger: number }) => {
  const map = useMap()
  useEffect(() => {
    if (lat !== 0 && lng !== 0) {
      map.flyTo([lat, lng], 17, { animate: true, duration: 0.5 })
    }
  }, [lat, lng, trigger, map])
  return null
}

// Ambil nomor shift dari nama shift API ("Shift 1" -> "1"), fallback ke sequence
const toShiftValue = (shift?: { shift_name?: string; sequence?: number }): string | undefined => {
  const parsed = shift?.shift_name?.match(/(\d+)\s*$/)?.[1]
  if (parsed) return parsed
  return shift?.sequence != null ? String(shift.sequence) : undefined
}

const DistributionMapPage = () => {
  const [showPanel, setShowPanel] = useState(true)
  // '' = ALL (tanpa filter equipment_code)
  const [search, setSearch] = useState<string>('')
  const [category, setCategory] = useState<string>()

  // Override hanya terisi saat user mengubah filter.
  // Selama null, nilai dipakai dari default operasional (current shift).
  const [dateOverride, setDateOverride] = useState<dayjs.Dayjs | null>(null)
  const [shiftOverride, setShiftOverride] = useState<string | null>(null)

  // Alert terpilih dari list: memicu marker berkedip, flyTo, dan popup.
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const [flyToTrigger, setFlyToTrigger] = useState(0)

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

  const dateStr = selectedDate.format('YYYY-MM-DD')
  const shiftLabel = `Shift ${shift}`

  // ─── Data Alert (kosong saat pertama load) ─────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['alerts', dateStr, shiftLabel, category, search],
    queryFn: () => {
      const params = {
        page: 1,
        limit: 999999,
        created_at: dateStr,
        created_at_end: dateStr,
        shift: shiftLabel,
        ...(category ? { alert_category_id: category } : {}),
        ...(search ? { search } : {}),
      }
      // console.log('[DistributionMapPage] query params:', params)
      return alertApi.getAll(params).then((r) => {
        // console.log(
        //   '[DistributionMapPage] response total:',
        //   r.data?.meta?.total,
        //   'data count:',
        //   r.data?.data?.length,
        // )
        return r.data
      })
    },
  })

  const alerts = (data?.data ?? []).filter((alert) => {
    // '' = ALL → tampilkan seluruh alert pada tanggal tersebut
    if (!search) return true
    const code = alert.equipments?.equipment_code ?? alert.vessel
    return code === search
  })

  const selectedAlert = useMemo(
    () => alerts.find((a) => a.id === selectedAlertId) ?? null,
    [alerts, selectedAlertId],
  )

  // Pindahkan map ke alert terpilih & tandai marker-nya sebagai terpilih.
  const focusAlert = useCallback((alert: Alert) => {
    setSelectedAlertId(alert.id)
    setFlyToTrigger((prev) => prev + 1)
  }, [])

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
            <ResetViewButton />
            <GeofenceLayer geoJson={geoJson} />
            <FlyToAlert
              lat={Number(selectedAlert?.latitude ?? 0)}
              lng={Number(selectedAlert?.longitude ?? 0)}
              trigger={flyToTrigger}
            />
            {alerts.map((alert) =>
              alert.id === selectedAlertId ? null : (
                <AlertDotMarker key={alert.id} alert={alert} />
              ),
            )}
            {selectedAlert && (
              <SelectedAlertMarker
                key={`selected-${selectedAlert.id}`}
                alert={selectedAlert}
                trigger={flyToTrigger}
              />
            )}
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
              showAllOption
              onChange={(code) => setSearch(code ?? '')}
            />
            <div style={{ display: 'flex', gap: 8 }}>
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
            <Select
              style={{ width: '100%' }}
              size="large"
              allowClear
              placeholder="Filter by Abnormal Alert Category"
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
            <DistributionAlertList
              data={alerts}
              selectedId={selectedAlertId}
              onSelect={focusAlert}
            />
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default DistributionMapPage
