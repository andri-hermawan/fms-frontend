// TrackingPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Select, Spin } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import PageHeader from '@/components/ui/PageHeader'
import CurrentDateDisplay from '@/components/ui/CurrentDateDisplay'

import {
  BaseMap,
  MapController,
  MapLayers,
  MapResize,
  ResetViewButton,
  MapLegend,
} from '@/components/map'

import { useAuthStore } from '@/stores/auth.store'
import { useCurrentShift } from '@/pages/master/shift/useShift'
import {
  selectPositions,
  useEquipmentStatusStore,
} from '@/stores/equipment-status.store'
import equipmentStatusApi from '@/services/api/equipment-status.api'
import type { EquipmentLiveStatus } from '@/types/equipment-status.types'

import useSocketTracking from '@/pages/tracking/hooks/useSocketTracking'
import { useActivitySummary } from '@/pages/tracking/hooks/useActivitySummary'

import EquipmentSearch from './components/EquipmentSearch'
import EquipmentListPanel from './components/EquipmentListPanel'
import DumpTruckStatusPanel from './components/DumpTruckStatusPanel'
import AlertSectionsPanel from './components/AlertSectionsPanel'

type LiveResponse = {
  statusCode?: number
  message?: string
  data: EquipmentLiveStatus[] | { data: EquipmentLiveStatus[] }
}

const extractInitialEquipment = (response: LiveResponse): EquipmentLiveStatus[] => {
  if (Array.isArray(response.data)) return response.data
  if (response.data && Array.isArray(response.data.data)) return response.data.data
  return []
}

const TrackingPage = () => {
  const [showPanel, setShowPanel] = useState(true)
  const [selectedDate] = useState(dayjs()) //setSelectedDate
  const [selectedEquipment, setSelectedEquipment] = useState<string>()
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>()

  // One-time initial snapshot. Socket.IO remains responsible for realtime updates.
  useEffect(() => {
    let cancelled = false

    const loadInitialEquipment = async () => {
      // console.log('[TrackingPage] Loading initial equipment snapshot...')
      try {
        const response = await equipmentStatusApi.getLive()
        const list = extractInitialEquipment(response.data as LiveResponse)
        // console.log('[TrackingPage] Initial equipment count:', list.length)

        if (!cancelled && list.length > 0) {
          useEquipmentStatusStore.getState().setBulkPositions(list)
          // console.log(
          //   '[TrackingPage] positionsMap initialized:',
          //   Object.keys(useEquipmentStatusStore.getState().positions).length,
          // )
        }
      } catch (error) {
        console.error('[TrackingPage] Initial equipment load failed:', error)
      }
    }

    loadInitialEquipment()
    return () => {
      cancelled = true
    }
  }, [])

  // Socket.IO supplies initial-data and realtime updates.
  useSocketTracking()

  const project = useAuthStore((s) => s.project)
  const geoJson = project?.geojson_origin ?? null

  const currentShift = useCurrentShift(project?.id, dayjs().format('HH:mm'))

  const positionsMap = useEquipmentStatusStore(selectPositions)

  const equipments = useMemo(
    () => Object.values(positionsMap),
    [positionsMap],
  )

  // Debug: Log equipment data
  // console.log('[TrackingPage] positionsMap:', positionsMap)
  // console.log('[TrackingPage] equipments count:', equipments.length)
  // console.log('[TrackingPage] equipments:', equipments)

  const equipmentOptions = useMemo(
    () =>
      equipments
        .slice()
        .sort((a, b) =>
          a.equipment_code.localeCompare(b.equipment_code),
        )
        .map((item) => ({
          label: item.equipment_code,
          value: item.equipment_code,
        })),
    [equipments],
  )

  const filteredEquipments = useMemo(() => {
    if (!selectedEquipment) return equipments

    return equipments.filter(
      (x) => x.equipment_code === selectedEquipment,
    )
  }, [equipments, selectedEquipment])

  const selectedEquipmentData = useMemo(
    () => equipments.find((x) => x.equipment_id === selectedEquipmentId),
    [equipments, selectedEquipmentId],
  )

  // TIDAK fallback ke filteredEquipments[0] lagi.
  // undefined saat load pertama -> MapController pakai defaultCenter/defaultZoom (tidak zoom in).
  // terisi saat user search/pilih -> MapController flyTo zoom 19.
  const mapFocusEquipment = selectedEquipmentData

  const isConnected = useEquipmentStatusStore((s) => s.isConnected)
  const isLoading = equipments.length === 0 && !isConnected

  const handleSelectEquipment = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId)

    const equipment = equipments.find(
      (x) => x.equipment_id === equipmentId,
    )

    if (equipment) {
      setSelectedEquipment(equipment.equipment_code)
    }
  }
  // ─── Activity Summary ───────────────────────────────────────
  const {
    summaries: activitySummaries,
    loadingIds: activityLoadingIds,
    refresh: refreshActivitySummary,
  } = useActivitySummary(selectedDate)

  // Fetch summary saat equipment dipilih / berubah.
  useEffect(() => {
    if (selectedEquipmentId) {
      void refreshActivitySummary(selectedEquipmentId)
    }
  }, [selectedEquipmentId, refreshActivitySummary])

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
        <PageHeader title="Live Tracking Monitoring" />

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
              latitude={mapFocusEquipment?.latitude}
              longitude={mapFocusEquipment?.longitude}
              zoom={19}
            />

            <ResetViewButton />

            <MapLegend />

            <MapLayers
              geoJson={geoJson}
              equipments={filteredEquipments}
              selectedEquipment={selectedEquipmentId}
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
              <EquipmentSearch
                value={selectedEquipment}
                options={equipmentOptions}
                onChange={(code) => {
                  setSelectedEquipment(code)

                  const equipment = equipments.find(
                    (x) => x.equipment_code === code,
                  )

                  setSelectedEquipmentId(equipment?.equipment_id)
                }}
              />
              
              <CurrentDateDisplay value={selectedDate} disabled />

              {/* <CurrentDateDisplay
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
              /> */}

              <Select
                size="large"
                value={currentShift.data?.shift_name}
                loading={currentShift.isLoading}
                disabled
                options={
                  currentShift.data
                    ? [{ label: currentShift.data.shift_name, value: currentShift.data.shift_name }]
                    : []
                }
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,240px) minmax(0,1fr)',
                gap: 16,
                flex: '1 1 0%',
                minHeight: 0,
                minWidth: 0,
              }}
            >
              <EquipmentListPanel
                equipments={filteredEquipments}
                selectedEquipmentId={selectedEquipmentId}
                onSelectEquipment={handleSelectEquipment}
                activitySummaries={activitySummaries}
                activityLoadingIds={activityLoadingIds}
                onRefreshActivity={refreshActivitySummary}
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  minHeight: 0,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    minWidth: 0,
                  }}
                >
                  <DumpTruckStatusPanel
                    equipment={selectedEquipmentData}
                    equipments={equipments}
                    totalCount={equipments.length}
                  />
                </div>

                <div
                  style={{
                    flex: '1 1 0%',
                    minHeight: 0,
                    minWidth: 0,
                  }}
                >
                  <AlertSectionsPanel
                    equipment={selectedEquipmentData}
                    selectedDate={selectedDate}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackingPage