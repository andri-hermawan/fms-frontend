import { useState } from 'react'
import { Drawer, Badge, Button, Spin, Empty, Typography, Tag } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useAlerts } from '@/pages/alert/useAlert'
import { useAlertStore } from '@/stores/alert.store'
import { App } from 'antd'
import { ROUTES } from '@/router/routes'
import { formatRelative, formatSpeed } from '@/utils/format'
import alertApi from '@/services/api/alert.api'
import type { Alert } from '@/types/alert.types'

const { Text } = Typography

const alertColorMap: Record<string, string> = {
  Overspeed: 'red',
  Underspeed: 'orange',
  Offtrack: 'purple',
  'Fuel Decrease': 'gold',
  'Fuel Increase': 'gold',
}

const getAlertDetail = (alert: Alert): string => {
  const cat = alert.alert_categories?.alert_category_name?.toLowerCase() ?? ''

  if (cat.includes('fuel')) {
    if (alert.fuel_level == null) return '-'
    return String(alert.fuel_level)
  }

  if (alert.status === 'Overspeed' || alert.status === 'Underspeed' || cat.includes('speed')) {
    return formatSpeed(Number(alert.speed) || 0)
  }

  if (alert.status === 'Offtrack' || cat.includes('offtrack')) {
    return alert.segment || alert.location_category || '-'
  }

  return '-'
}

const AlertDropdown = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { message } = App.useApp()
  const unreadCount = useAlertStore((s) => s.unreadCount)
  const markAllAsRead = useAlertStore((s) => s.markAllAsRead)

  const today = dayjs().format('YYYY-MM-DD')

  const queryParams = {
    page: 1,
    limit: 100,
    created_at: today,
    created_at_end: today,
    is_read: false,
  }

  const { data, isLoading, refetch } = useAlerts(queryParams)

  const alerts = data?.data ?? []
  const total = data?.meta?.total ?? 0

  const handleOpen = () => {
    setOpen(true)
    refetch()
  }

  const handleClose = () => {
    const alertIds = alerts.map((a) => a.id)
    setOpen(false)
    if (alertIds.length === 0) return
    Promise.allSettled(
      alertIds.map((id) => alertApi.markAsRead(id)),
    ).then((results) => {
      const failed = results.filter((r) => r.status === 'rejected')
      markAllAsRead()
      if (failed.length > 0) {
        message.error(`${failed.length} alert gagal ditandai dibaca`)
      }
    })
  }

  const handleViewAll = () => {
    setOpen(false)
    navigate(ROUTES.ALERT)
  }

  const handleAlertClick = (id: string, equipmentCode: string | undefined, today: string, shift: string | undefined) => {
    // console.log('handleAlertClick id:', id)
    // console.log('equipmentCode:', equipmentCode)
    // console.log('today:', today)
    // console.log('shift:', shift)
    setOpen(false)
    const params = new URLSearchParams()
    if (equipmentCode) params.set('equipmentCode', equipmentCode)
    if (today) params.set('date', today)
    if (shift) params.set('shift', shift)
    navigate(`${ROUTES.POSITION_HISTORY}?${params.toString()}`)
  }
  return (
    <>
      <Badge count={unreadCount} size="small">
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          onClick={handleOpen}
        />
      </Badge>

      <Drawer
        title="Notifikasi"
        open={open}
        onClose={handleClose}
        placement="right"
        size="default"
        styles={{ body: { padding: 0 } }}
        footer={
          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={handleViewAll}>
              Show All Alerts
            </Button>
          </div>
        }
      >
        {total > 0 && (
          <div
            style={{
              padding: '8px 24px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              {total} belum dibaca
            </Text>
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : alerts.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Tidak ada notifikasi"
            style={{ padding: 48 }}
          />
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => handleAlertClick(alert.id, alert.equipments?.equipment_code, today, alert.shift)}
              style={{
                padding: '14px 24px',
                borderBottom: '1px solid #f5f5f5',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fafafa'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
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
                <Tag
                  color={alertColorMap[alert.status] ?? 'default'}
                  style={{ marginRight: 0 }}
                >
                  {alert.status}
                </Tag>
                <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>
                  {formatRelative(alert.created_at)}
                </Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13 }}>
                  {alert.equipments?.equipment_code ?? '-'}
                  {alert.location_category && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {' · '}
                      {alert.location_category}
                    </Text>
                  )}
                  {alert.segment && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {' · '}
                      {alert.segment}
                    </Text>
                  )}
                </Text>
                <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
                  {getAlertDetail(alert)}
                </Text>
              </div>
            </div>
          ))
        )}
      </Drawer>
    </>
  )
}

export default AlertDropdown
