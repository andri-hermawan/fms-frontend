import { Empty, Space } from 'antd'
import { formatTime } from '@/utils/format'
import type { EquipmentLog } from '@/types/equipment-logs.types'

interface PositionHistoryListProps {
  data: EquipmentLog[]
}

const PositionHistoryList = ({ data }: PositionHistoryListProps) => {
  if (data.length === 0) {
    return <Empty description="No data available" style={{ marginTop: 48 }} />
  }

  return (
    <Space orientation="vertical" size={8} style={{ width: '100%' }}>
      {data.map((log) => (
        <div
          key={log.id}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #f0f0f0',
            background: '#fff',
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
            <span style={{ fontWeight: 600 }}>
              {log.segment || log.category_location || '-'}
            </span>
            <span>
              {log.created_at ? formatTime(log.created_at) : '-'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            Speed: {log.speed} km/h · Fuel: {log.fuel_percentage}%
            {log.alerts?.length ? ` · ${log.alerts.map((a) => a.status).join(', ')}` : ''}
          </div>
        </div>
      ))}
    </Space>
  )
}

export default PositionHistoryList