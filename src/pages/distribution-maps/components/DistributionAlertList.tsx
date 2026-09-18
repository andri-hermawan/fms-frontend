import { Empty, Space } from 'antd'
import { formatTime } from '@/utils/format'
import { getAlertCategoryColor, getAlertCategoryTextColor } from '@/utils/alert-category'
import type { Alert } from '@/types/alert.types'

interface DistributionAlertListProps {
  data: Alert[]
  selectedId?: string | null
  onSelect?: (alert: Alert) => void
}

const DistributionAlertList = ({
  data,
  selectedId,
  onSelect,
}: DistributionAlertListProps) => {
  if (data.length === 0) {
    return <Empty description="No alert found" style={{ marginTop: 48 }} />
  }

  return (
    <Space orientation="vertical" size={8} style={{ width: '100%' }}>
      {data.map((alert) => {
        const category = alert.alert_categories?.alert_category_name ?? alert.status
        const bg = getAlertCategoryColor(category) ?? '#ffffff'
        const fg = getAlertCategoryTextColor(category)

        return (
          <div
            key={alert.id}
            onClick={() => onSelect?.(alert)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              background: bg,
              transition: 'background .2s',
              cursor: onSelect ? 'pointer' : 'default',
              ...(selectedId === alert.id
                ? {
                    border: '1px solid #064596',
                    boxShadow: '0 0 0 2px rgba(6, 69, 150, 0.25)',
                  }
                : {}),
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
                {alert.equipments?.equipment_code ?? alert.vessel ?? '-'}
              </span>
              <span style={{ color: fg }}>
                {alert.created_at ? formatTime(alert.created_at) : '-'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: fg, opacity: 0.92 }}>
                {category} · Speed: {alert.speed} km/h  
            </div>
            <div style={{ fontSize: 12, color: fg, opacity: 0.92 }}>
                Map Segment: {alert.segment}  
            </div>
          </div>
        )
      })}
    </Space>
  )
}

export default DistributionAlertList
