// components/AlertSectionsPanel.tsx
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'

import type { AlertCategorySummary } from '@/types/alert.types'
import type { EquipmentMarkerData } from '@/types/map.types'
import { useAlertSummaryByCategory } from '@/pages/alert/useAlert'
import { selectSummary, useAlertStore } from '@/stores/alert.store'
import { getAlertCategoryColor } from '@/utils/alert-category'

interface Props {
  equipment?: EquipmentMarkerData
  selectedDate: Dayjs
}

const AlertSectionsPanel = ({ equipment, selectedDate }: Props) => {
  const dateStr = selectedDate.format('YYYY-MM-DD')
  const searchCode = equipment?.equipment_code
  // console.log('[AlertSectionsPanel] dateStr:', dateStr)
  // console.log('[AlertSectionsPanel] searchCode:', searchCode)
  const { data, isLoading, isError, error } = useAlertSummaryByCategory({
    created_at: dateStr,
    created_at_end: dateStr,
    search: searchCode,
  })

  // Latest summary pushed by the ALERT_SUMMARY_UPDATE socket event. When the
  // socket has delivered data it takes precedence so the panel shows the exact
  // payload (including duration) the backend sent.
  const socketSummary = useAlertStore(selectSummary)

  // console.log(
  // '[AlertSectionsPanel] request URL:',
  // `/fms/api/alerts/summary_by_category?search=${searchCode ?? ''}&created_at=${dateStr}&resolved_at=${dateStr}`,
  // )
  // console.log('[AlertSectionsPanel] equipment (selected):', equipment)
  // console.log('[AlertSectionsPanel] search param dikirim ke API:', searchCode)
  // console.log('[AlertSectionsPanel] dateStr:', dateStr)
  // console.log('[AlertSectionsPanel] response data:', data)

  // The API normally returns { data: AlertCategorySummary[] }, but some
  // deployments return the array directly or wrap it one level deeper.
  const responseData: unknown = data?.data
  const apiAlerts = Array.isArray(responseData)
    ? responseData as AlertCategorySummary[]
    : responseData && typeof responseData === 'object' && 'data' in responseData
      ? Array.isArray((responseData as { data?: unknown }).data)
        ? (responseData as { data: AlertCategorySummary[] }).data
        : []
      : []

  // Prefer the socket payload (exact duration/values) when available.
  const alerts = socketSummary.length > 0 ? socketSummary : apiAlerts

  // console.log('[AlertSectionsPanel] summary response:', data)
  // console.log('[AlertSectionsPanel] summary rows:', alerts.length)
  if (isError) console.error('[AlertSectionsPanel] summary request failed:', error)
  // console.log('[AlertSectionsPanel] alerts (rendered):', alerts)

  const columns: ColumnsType<AlertCategorySummary> = [
    {
      title: 'Event',
      dataIndex: 'alert_category_name',
      width: '30%',
      ellipsis: true,
    },
    {
      title: 'Equipment',
      dataIndex: 'equipment_code',
      width: '26%',
      ellipsis: true,
    },
    {
      title: 'Count',
      dataIndex: 'alert_count',
      width: '21%',
      align: 'center',
    },
    // {
    //   title: 'Duration',
    //   dataIndex: 'duration',
    //   width: '23%',
    //   align: 'center',
    // },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
        height: '100%',
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#064596', color: '#fff'
        }}
      >
        <span>ALERT SUMMARY</span>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Table
          rowKey={(record) =>
            `${record.alert_category_name}-${record.equipment_code}`
          }
          columns={columns}
          dataSource={alerts}
          loading={isLoading}
          pagination={false}
          size="small"
          tableLayout="fixed"
          sticky
          scroll={{ y: '100%' }}
          locale={{ emptyText: 'No alert data available' }}
          onRow={(record) => {
            const color = getAlertCategoryColor(record.alert_category_name)
            return color
              ? {
                  style: {
                    background: color,
                    color: '#fff',
                  },
                }
              : {}
          }}
        />
      </div>
    </div>
  )
}

export default AlertSectionsPanel