// components/DumpTruckStatusPanel.tsx
import { useState } from 'react'
import { ReloadOutlined, MenuOutlined } from '@ant-design/icons'
import type { EquipmentMarkerData } from '@/types/map.types'
import { getMarkerIcon } from '@/utils/marker-icon'
import { formatTime } from '@/utils/format'

interface Props {
  equipment?: EquipmentMarkerData
  equipments: EquipmentMarkerData[]
  totalCount: number
}

const getIconNameFromUrl = (url: string) => {
  return (
    url
      .split('/')
      .pop()
      ?.replace(/\.[^/.]+$/, '') ?? ''
  )
}

interface IconGroup {
  iconName: string
  iconUrl: string
  items: EquipmentMarkerData[]
  lastUpdate?: string
}

const DumpTruckStatusPanel = ({ equipment, equipments, totalCount }: Props) => {
  const [expandedGroup, setExpandedGroup] = useState<string>()

  const listToShow = equipment ? [equipment] : equipments

  const groups: IconGroup[] = Object.values(
    listToShow.reduce<Record<string, IconGroup>>((acc, item) => {
      const icon = getMarkerIcon(item)
      const iconUrl = icon?.options.iconUrl as string | undefined
      const iconName = iconUrl ? getIconNameFromUrl(iconUrl) : 'unknown'

      if (!acc[iconName]) {
        acc[iconName] = {
          iconName,
          iconUrl: iconUrl ?? '',
          items: [],
          lastUpdate: item.recorded_at,
        }
      }

      acc[iconName].items.push(item)

      if (
        item.recorded_at &&
        (!acc[iconName].lastUpdate ||
          new Date(item.recorded_at) > new Date(acc[iconName].lastUpdate!))
      ) {
        acc[iconName].lastUpdate = item.recorded_at
      }

      return acc
    }, {}),
  ).sort((a, b) => b.items.length - a.items.length)
  // console.log(groups, 'groups')

  const handleToggleGroup = (iconName: string) => {
    setExpandedGroup((prev) => (prev === iconName ? undefined : iconName))
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 160,
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid #064596',
        borderRadius: 8,
      }}
    >
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid #f0f0f0',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.4,
          background: '#064596',
          color: '#fff',
        }}
      >
        EQUIPMENT STATUS
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            borderBottom: '1px solid #f5f5f5',
          }}
        >
          <ReloadOutlined style={{ fontSize: 22, flexShrink: 0 }} />
          <span
            style={{
              fontWeight: 700,
              fontSize: 13,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {totalCount} Total
          </span>
        </div>

        {groups.length === 0 && (
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              color: '#bbb',
              fontSize: 12,
            }}
          >
            No equipment status available
          </div>
        )}

        {groups.map((group) => {
          const isExpanded = expandedGroup === group.iconName

          return (
            <div
              key={group.iconName}
              style={{
                borderBottom: '1px solid #f5f5f5',
              }}
            >
              <div
                onClick={() => handleToggleGroup(group.iconName)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  background: isExpanded ? '#fff7e6' : 'transparent',
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
                  {group.iconUrl && (
                    <img
                      src={group.iconUrl}
                      alt={group.iconName}
                      style={{
                        width: 30,
                        height: 30,
                        objectFit: 'contain',
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {group.items.length} Dump Truck
                  </span>
                </div>

                <MenuOutlined
                  style={{
                    color: '#064596',
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                />
              </div>

              {isExpanded && (
                <div
                  style={{
                    padding: '8px 12px 12px',
                    background: '#fafafa',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: 11,
                      fontWeight: 600,
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      padding: '2px 8px',
                      marginBottom: 6,
                    }}
                  >
                    Last Update {formatTime(group.lastUpdate)}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    {group.items.map((item) => (
                      <div
                        key={item.equipment_id}
                        style={{
                          fontSize: 12,
                          color: '#333',
                        }}
                      >
                        - {item.equipment_code}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DumpTruckStatusPanel