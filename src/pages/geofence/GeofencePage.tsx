// GeofencePage.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  message,
  Select,
  Spin,
} from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import PageHeader from '@/components/ui/PageHeader'
import CurrentDateDisplay from '@/components/ui/CurrentDateDisplay'

import {
  BaseMap,
  DrawControl,
  MapController,
  MapLayers,
  MapResize,
} from '@/components/map'

import EquipmentPassingTable from './components/EquipmentPassingTable'
import HourlySummaryTable from './components/HourlySummaryTable'
import HourlyTrafficChart from './components/HourlyTrafficChart'

import { useAuthStore } from '@/stores/auth.store'
import { useCurrentShift } from '@/pages/master/shift/useShift'
import {
  selectPositions,
  useEquipmentStatusStore,
} from '@/stores/equipment-status.store'

import useSocketTracking from '@/pages/tracking/hooks/useSocketTracking'
import type { GeofenceEventData } from '@/pages/tracking/hooks/useSocketTracking'
import projectApi from '@/services/api/project.api'
import geofenceApi from '@/services/api/geofence.api'
import { useGeofenceStore } from '@/stores/geofence.store'
import SegmentSearch from './components/SegmentSearch'

const GeofencePage = () => {
  const [showPanel, setShowPanel] = useState(true)
  const [selectedDate] = useState(dayjs())
  const [selectedSegment, setSelectedSegment] = useState<string>()

  const setPassing = useGeofenceStore((s) => s.setPassing)
  const setSummary = useGeofenceStore((s) => s.setSummary)

  const refreshGeofenceData = useCallback(async (event?: GeofenceEventData) => {
    try {
      const params = {
        page: 1,
        limit: 10,
        segment: selectedSegment,
        start_date: selectedDate.startOf('day').format('YYYY-MM-DD'),
        end_date: selectedDate.endOf('day').format('YYYY-MM-DD'),
      }

      const [passingRes, summaryRes] = await Promise.all([
        geofenceApi.getPassing(params),
        geofenceApi.getPassingSummary(params),
      ])

      setPassing(passingRes.data.data)
      setSummary(summaryRes.data.data)

      console.log('[GeofencePage] Realtime data refreshed:', {
        event: event?.event ?? event?.event_type,
        passing: passingRes.data.data.length,
        summary: summaryRes.data.data.length,
      })
    } catch (err) {
      console.error('[GeofencePage] Failed to refresh geofence data:', err)
    }
  }, [selectedDate, selectedSegment, setPassing, setSummary])

  useSocketTracking({
    onGeofenceEvent: refreshGeofenceData,
  })

  const project = useAuthStore((s) => s.project)
  const geoJson = project?.geojson_origin ?? null

  const currentShift = useCurrentShift(project?.id, dayjs().format('HH:mm'))

  const positionsMap = useEquipmentStatusStore(selectPositions)

  const equipments = useMemo(
    () => Object.values(positionsMap),
    [positionsMap],
  )

  const segmentOptions = useMemo(() => {
    const uniqueSegments = Array.from(
      new Set(
        equipments
          .map((x) => x.segment)
          .filter((x): x is string => Boolean(x)),
      ),
    ).sort((a, b) => a.localeCompare(b))

    return uniqueSegments.map((segment) => ({
      label: segment,
      value: segment,
    }))
  }, [equipments])

  const filteredEquipments = useMemo(() => {
    if (!selectedSegment) return equipments

    return equipments.filter(
      (x) => x.segment === selectedSegment,
    )
  }, [equipments, selectedSegment])

  // TIDAK fallback ke filteredEquipments[0] lagi.
  // undefined saat load pertama -> MapController pakai defaultCenter/defaultZoom (tidak zoom in).
  // terisi saat user pilih segment -> MapController flyTo zoom ke marker pertama segment tsb.
  const selectedMarker = selectedSegment
    ? filteredEquipments[0]
    : undefined

  const isConnected = useEquipmentStatusStore((s) => s.isConnected)
  const isLoading = equipments.length === 0 && !isConnected

  const [drawingGeoJson, setDrawingGeoJson] =
    useState<GeoJSON.GeoJSON | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSelectEquipment = (equipmentId: string) => {
    const equipment = equipments.find(
      (x) => x.equipment_id === equipmentId,
    )

    if (equipment?.segment) {
      setSelectedSegment(equipment.segment)
    }
  }

  const handleSavePolygon = async () => {
    if (!project?.id) return
    if (!drawingGeoJson) return

    try {
      setSaving(true)

      const { data } = await projectApi.updateGeoJson(
        project.id,
        drawingGeoJson,
      )

      useAuthStore.setState({ project: data.data })

      message.success('Polygon berhasil disimpan')
    } catch (err) {
      console.error(err)
      message.error('Gagal menyimpan polygon')
    } finally {
      setSaving(false)
    }
  }

  const passing = useGeofenceStore((s) => s.passing)
  const summary = useGeofenceStore((s) => s.summary)
  useEffect(() => {
    const load = async () => {
      try {
        await refreshGeofenceData()
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [refreshGeofenceData])

  const passingData = passing ?? []

  const filteredPassing = selectedSegment
    ? passingData.filter((x) => x.segment === selectedSegment)
    : passingData

  const hourlySummary = summary ?? []

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
        <PageHeader title="Geofence Monitoring" />

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            loading={saving}
            disabled={!drawingGeoJson}
            onClick={handleSavePolygon}
          >
            Save Polygon
          </Button>

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
            ? 'minmax(0, 1fr) minmax(0, 640px)'
            : '1fr',
          gap: 16,
          flex: 1,
          minHeight: 0,
          minWidth: 0,
        }}
      >
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
              <Spin size="large" description="Loading equipment..." />
            </div>
          )}

          <BaseMap>
            <MapResize deps={showPanel} />

            <MapController
              latitude={selectedMarker?.latitude}
              longitude={selectedMarker?.longitude}
              zoom={19}
            />

            <DrawControl
              editable
              onCreate={setDrawingGeoJson}
              onEdit={setDrawingGeoJson}
              onDelete={() => setDrawingGeoJson(null)}
            />

            <MapLayers
              geoJson={geoJson}
              equipments={filteredEquipments}
              selectedEquipment={undefined}
              onSelectEquipment={handleSelectEquipment}
            />
          </BaseMap>
        </Card>

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
                display: 'grid',
                gridTemplateColumns:
                  'minmax(0,1fr) minmax(150px,170px) minmax(100px,120px)',
                gap: 12,
                marginBottom: 16,
                flexShrink: 0,
                minWidth: 0,
              }}
            >
              <SegmentSearch
                value={selectedSegment}
                options={segmentOptions}
                onChange={(segment) => {
                  setSelectedSegment(segment)
                }}
              />

              <CurrentDateDisplay value={selectedDate} disabled />

              <Select
                size="large"
                value={currentShift.data?.id}
                loading={currentShift.isLoading}
                disabled
                options={
                  currentShift.data
                    ? [{ label: currentShift.data.shift_name, value: currentShift.data.id }]
                    : []
                }
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 16,
                flexShrink: 0,
                flexBasis: '38%',
                minHeight: 0,
                minWidth: 0,
              }}
            >
              <EquipmentPassingTable data={filteredPassing} />
              <HourlySummaryTable data={hourlySummary} />
            </div>

            <div
              style={{
                flex: '1 1 0%',
                minHeight: 0,
                minWidth: 0,
              }}
            >
              <HourlyTrafficChart data={hourlySummary} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GeofencePage