import { Empty, Space } from 'antd'
import { formatTime } from '@/utils/format'
import { getSpeedColor, getSpeedTextColor } from '@/utils/speed-color'
import type { EquipmentLog } from '@/types/equipment-logs.types'

interface SpeedPerSegmentListProps {
  data: EquipmentLog[]
}

const SpeedPerSegmentList = ({ data }: SpeedPerSegmentListProps) => {
  if (data.length === 0) {
    return <Empty description="No data available" style={{ marginTop: 48 }} />
  }

  return (
    <Space orientation="vertical" size={8} style={{ width: '100%' }}>
      {data.map((log) => {
        const speed = Number(log.speed) || 0
        const bg = getSpeedColor(speed)
        const fg = getSpeedTextColor(speed)

        return (
          <div
            key={log.id}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              background: bg,
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
              <span style={{ fontWeight: 600, color: fg }}>
                {log.equipment_code || '-'}
              </span>
              <span style={{ color: fg }}>
                {log.created_at ? formatTime(log.created_at) : '-'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: fg, opacity: 0.92 }}>
              Speed: {log.speed} km/h · Segment: {log.segment}
              {log.alerts?.length
                ? ` · ${log.alerts.map((a) => a.status).join(', ')}`
                : ''}
            </div>
          </div>
        )
      })}
    </Space>
  )
}

export default SpeedPerSegmentList