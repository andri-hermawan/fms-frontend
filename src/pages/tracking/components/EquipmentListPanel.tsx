// components/EquipmentListPanel.tsx
import { InfoCircleFilled } from '@ant-design/icons'

import type { EquipmentMarkerData } from '@/types/map.types'
import type { ActivitySummaryData } from '@/types/tracking.types'
import { getMarkerIcon } from '@/utils/marker-icon'
import { formatTime } from '@/utils/format'

interface Props {
  equipments: EquipmentMarkerData[]
  selectedEquipmentId?: string
  onSelectEquipment: (equipmentId: string) => void
  activitySummaries?: Record<string, ActivitySummaryData>
  activityLoadingIds?: string[]
  onRefreshActivity?: (equipmentId?: string) => void
}

const EquipmentListPanel = ({
  equipments,
  selectedEquipmentId,
  onSelectEquipment,
  activitySummaries = {},
  activityLoadingIds = [],
  onRefreshActivity,
}: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid #064596',
        borderRadius: 8,
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          flexShrink: 0,
          borderBottom: '1px solid #f0f0f0',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.4,
          background: '#064596',
          color: '#fff',
        }}
      >
        EQUIPMENT LIST
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {equipments.map((item) => {
          const isActive = item.equipment_id === selectedEquipmentId
          const icon = getMarkerIcon(item)
          const iconUrl = icon.options.iconUrl as string
          // console.log("iconUrl", iconUrl);
          return (
            <div
              key={item.equipment_id}
              style={{
                borderBottom: '1px solid #f5f5f5',
              }}
            >
              <div
                onClick={() => onSelectEquipment(item.equipment_id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  background: isActive ? '#fff7e6' : 'transparent',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    minWidth: 0,
                  }}
                >
                  <img
                    src={iconUrl}
                    alt={item.equipment_code}
                    style={{
                      width: 20,
                      height: 20,
                      objectFit: 'contain',
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontStyle: 'italic',
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.equipment_code}
                    </div>
                  </div>
                </div>

                <InfoCircleFilled
                  style={{
                    color: isActive ? '#064596' : '#bbb',
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                />
              </div>

              {isActive && (
                <div
                  style={{
                    padding: '10px 16px 14px',
                    background: '#fafafa',
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      Activity Summary
                      {activityLoadingIds.includes(item.equipment_id) && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            fontWeight: 500,
                            color: '#8c8c8c',
                          }}
                        >
                          loading...
                        </span>
                      )}
                    </span>

                    <span
                      style={{
                        fontSize: 11,
                        color: '#fff',
                        background: '#064596',
                        borderRadius: 4,
                        padding: '2px 8px',
                        fontWeight: 600,
                        flexShrink: 0,
                        marginLeft: 8,
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onRefreshActivity?.(item.equipment_id)
                      }}
                      title="Klik untuk refresh"
                    >
                      {formatTime(item.recorded_at)}
                    </span>
                  </div>

                  <ActivitySummaryRows summary={activitySummaries[item.equipment_id]} />
                </div>
              )}
            </div>
          )
        })}

        {equipments.length === 0 && (
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              color: '#bbb',
              fontSize: 12,
            }}
          >
            No equipment list found
          </div>
        )}
      </div>
    </div>
  )
}

const formatDurationHours = (hours: number | undefined) =>
  hours === undefined || hours === null ? '-' : `${hours.toFixed(1)} h`

const ActivitySummaryRows = ({
  summary,
}: {
  summary?: ActivitySummaryData
}) => {
  const s = summary?.summary
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        rowGap: 4,
        columnGap: 8,
        fontSize: 12,
        color: '#333',
      }}
    >
      <span style={{ color: '#666' }}>Running Time</span>
      <span>: {formatDurationHours(s?.running_time)}</span>

      <span style={{ color: '#666' }}>Idling Time</span>
      <span>: {formatDurationHours(s?.idling_time)}</span>

      <span style={{ color: '#666' }}>Mileage</span>
      <span>
        : {s?.mileage === undefined || s?.mileage === null ? '-' : `${s.mileage.toFixed(1)} km`}
      </span>

      <span style={{ color: '#666' }}>Avg. Running Speed</span>
      <span>
        : {s?.avg_running_speed === undefined || s?.avg_running_speed === null ? '-' : `${s.avg_running_speed.toFixed(1)} km/h`}
      </span>

      <span style={{ color: '#666' }}>Max. Running Speed</span>
      <span>
        : {s?.max_running_speed === undefined || s?.max_running_speed === null ? '-' : `${s.max_running_speed.toFixed(1)} km/h`}
      </span>

      <span style={{ color: '#666' }}>Fuel Decrease</span>
      <span>
        : {s?.fuel_decrease === undefined || s?.fuel_decrease === null ? '-' : `${s.fuel_decrease.toFixed(1)} L`}
      </span>

      <span style={{ color: '#666' }}>Fuel Ratio</span>
      <span>
        : {s?.fuel_ratio === undefined || s?.fuel_ratio === null ? '-' : `${s.fuel_ratio.toFixed(1)} %`}
      </span>

      <span style={{ color: '#666' }}>Fuel Remaining</span>
      <span>
        : {s?.fuel_remaining === undefined || s?.fuel_remaining === null ? '-' : `${s.fuel_remaining.toFixed(1)} L`}
      </span>
    </div>
  )
}

export default EquipmentListPanel