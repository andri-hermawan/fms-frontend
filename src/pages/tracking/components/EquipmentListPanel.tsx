// components/EquipmentListPanel.tsx
// import { Tooltip } from 'antd'
import { CloseOutlined, InfoCircleFilled } from '@ant-design/icons'

import type { EquipmentMarkerData } from '@/types/map.types'
import type { ActivitySummaryData } from '@/types/tracking.types'
import { getMarkerIcon } from '@/utils/marker-icon'
import { formatTime } from '@/utils/format'

interface Props {
  equipments: EquipmentMarkerData[]
  selectedEquipmentId?: string
  onSelectEquipment: (equipmentId: string) => void
  onClearSelection: () => void
  activitySummaries?: Record<string, ActivitySummaryData>
  activityLoadingIds?: string[]
  onRefreshActivity?: (equipmentId?: string) => void
  onOpenBreakdown?: (equipment: EquipmentMarkerData) => void
}

const EquipmentListPanel = ({
  equipments,
  selectedEquipmentId,
  onSelectEquipment,
  onClearSelection,
  activitySummaries = {},
  activityLoadingIds = [],
  onRefreshActivity,
  // onOpenBreakdown,
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
                      width: 30,
                      height: 30,
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

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  {/* {isActive && onOpenBreakdown && (
                    <Tooltip title="Input Breakdown">
                      <ToolFilled
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenBreakdown(item)
                        }}
                        style={{
                          color: '#064596',
                          fontSize: 16,
                          cursor: 'pointer',
                        }}
                      />
                    </Tooltip>
                  )} */}

                  {isActive ? (
                    <CloseOutlined
                      onClick={(e) => {
                        e.stopPropagation()
                        onClearSelection()
                      }}
                      style={{
                        color: '#064596',
                        fontSize: 16,
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                      title="Clear selection"
                    />
                  ) : (
                    <InfoCircleFilled
                      style={{
                        color: '#bbb',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
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

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  fontSize: 12,
  lineHeight: '20px',
}

const labelStyle: React.CSSProperties = {
  color: '#666',
  width: 90,
  flexShrink: 0,
}

const valueStyle: React.CSSProperties = {
  color: '#333',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  marginLeft: 'auto',
  display: 'inline-block',
  width: 62,
  textAlign: 'right',
}

const subStyle: React.CSSProperties = {
  ...rowStyle,
  paddingLeft: 14,
}

const subLabelStyle: React.CSSProperties = {
  color: '#999',
  width: 76,
  flexShrink: 0,
  fontSize: 11,
}

const subValueStyle: React.CSSProperties = {
  color: '#555',
  fontSize: 11,
  fontWeight: 400,
  whiteSpace: 'nowrap',
  marginLeft: 'auto',
  display: 'inline-block',
  width: 62,
  textAlign: 'right',
}

const ActivitySummaryRows = ({
  summary,
}: {
  summary?: ActivitySummaryData
}) => {
  const s = summary?.summary
  const h = (v: number | undefined) => v == null ? '-' : v.toFixed(2)
  const f = h

  return (
    <div style={{ color: '#333' }}>
      {/* Running Time */}
      <div style={rowStyle}>
        <span style={{ ...labelStyle, fontWeight: 600, color: '#444' }}>Running Time</span>
        <span style={valueStyle}>{h(s?.running_time)} hours</span>
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Empty</span>
        <span style={subValueStyle}>{h(s?.running_empty)} hours</span>
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Loaded</span>
        <span style={subValueStyle}>{h(s?.running_loaded)} hours</span>
      </div>

      {/* Idling Time */}
      <div style={rowStyle}>
        <span style={{ ...labelStyle, fontWeight: 600, color: '#444' }}>Idling Time</span>
        <span style={valueStyle}>{h(s?.idling_time)} hours</span>
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Empty</span>
        <span style={subValueStyle}>{h(s?.idling_empty)} hours</span>
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Loaded</span>
        <span style={subValueStyle}>{h(s?.idling_loaded)} hours</span>
      </div>

      {/* Avg. Running Speed */}
      <div style={rowStyle}>
        <span style={{ ...labelStyle, fontWeight: 600, color: '#444' }}>Avg Speed</span>
        <span style={valueStyle}>       {f(s?.avg_running_speed)} km/h</span>
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Empty</span>
        <span style={subValueStyle}>{f(s?.avg_running_speed_empty)} km/h</span>
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Loaded</span>
        <span style={subValueStyle}>{f(s?.avg_running_speed_loaded)} km/h</span>
      </div>

      {/* Max Speed */}
      <div style={rowStyle}>
        <span style={{ ...labelStyle, fontWeight: 600, color: '#444' }}>Max Speed</span>
        <span style={valueStyle}>{f(s?.max_running_speed)} km/h</span>
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Empty</span>
        <span style={subValueStyle}>{f(s?.max_running_speed_empty)} km/h</span>
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Loaded</span>
        <span style={subValueStyle}>{f(s?.max_running_speed_loaded)} km/h</span>
      </div>

      {/* Mileage */}
      <div style={rowStyle}>
        <span style={{ ...labelStyle, fontWeight: 600, color: '#444' }}>Mileage</span>
        <span style={valueStyle}>{f(s?.mileage)} km</span>
      </div>

      {/* Fuel */}
      <div style={{ ...rowStyle, marginBottom: 2 }}>
        <span style={{ ...labelStyle, fontWeight: 600, color: '#444' }}>Fuel</span>
        <span />
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Start</span>
        <span style={subValueStyle}>{f(s?.fuel_start_run)} L</span>
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Remaining</span>
        <span style={subValueStyle}>{f(s?.fuel_remaining)} L</span>
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Increase</span>
        <span style={subValueStyle}>{f(s?.fuel_increase)} L</span>
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Decrease</span>
        <span style={subValueStyle}>{f(s?.fuel_decrease)} L</span>
      </div>
      <div style={subStyle}>
        <span style={subLabelStyle}>Burn Ratio</span>
        <span style={subValueStyle}>{f(s?.fuel_burn_ratio)} L/h</span>
      </div>
    </div>
  )
}

export default EquipmentListPanel