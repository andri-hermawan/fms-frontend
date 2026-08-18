import { Button, Space, Tooltip, DatePicker } from 'antd'
const { RangePicker } = DatePicker
import { ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import usePagination from '@/hooks/usePagination'
import { formatDate, formatDurationBetween, formatTime } from '@/utils/format'
import type { Alert } from '@/types/alert.types'
import { useAlerts } from '../useAlert'
import { useState } from 'react'
import dayjs, { type Dayjs } from 'dayjs'

const defaultRange: [Dayjs, Dayjs] = [
  dayjs().startOf('month'),
  dayjs().endOf('month'),
]

const FuelAlertPage = () => {
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(defaultRange)
  const {
    params,
    setSearch,
    setPage,
    setLimit,
    setDateRange,
  } = usePagination({
    created_at: defaultRange[0].format('YYYY-MM-DD'),
    created_at_end: defaultRange[1].format('YYYY-MM-DD'),
    alert_category: 'Fuel Decrease, Fuel Increase',
  })
  const { data, isLoading, refetch } = useAlerts(params)

  const fuelData = (data?.data ?? []).filter((d) =>
    d.alert_categories?.alert_category_name?.toLowerCase().includes('fuel'),
  )

  const columns: ColumnsType<Alert> = [
    {
      title: 'Alert',
      dataIndex: 'status',
      width: 180,
      align: 'left',
      render: (_, record) => record.alert_categories?.alert_category_name ?? '-',
    },
    {
      title: 'Unit Code',
      width: 120,
      align: 'left',
      render: (_, record) => record.equipments?.equipment_code ?? '-',
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      width: 120,
      align: 'left',
      render: (value) => formatDate(value),
    },
    {
      title: 'Start',
      dataIndex: 'created_at',
      width: 120,
      align: 'center',
      render: (value) => formatTime(value),
    },
    {
      title: 'Stop',
      dataIndex: 'resolved_at',
      width: 120,
      align: 'center',
      render: (value) => formatTime(value),
    },
    {
      title: 'Duration',
      width: 120,
      align: 'center',
      render: (_, record) => {
        return formatDurationBetween(
          record.created_at,
          record.resolved_at,
        )
      },
    },
    {
      title: 'Speed',
      dataIndex: 'speed',
      width: 120,
      align: 'center',
    },
    {
      title: 'Fuel',
      dataIndex: 'fuel_level',
      width: 120,
      align: 'center',
    },
    {
      title: 'Initial Zone',
      dataIndex: 'segment',
      width: 140,
      align: 'left',
    },
  ]

  return (
    <>
      <PageHeader
        title="Fuel Alerts"
        subtitle={`Total ${data?.meta?.total ?? 0} alert`}
        extra={
          <Space>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} /></Tooltip>
            {/* {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add</Button>} */}
          </Space>
        }
      />
      <DataTable<Alert>
        rowKey="id"
        columns={columns}
        dataSource={fuelData}
        loading={isLoading}
        searchable={false}
        searchPlaceholder="Find Alert Event Or Unit Code..."
        onSearch={setSearch}
        toolbar={
          <RangePicker
            allowClear
            format="DD MMM YYYY"
            value={range}
            onChange={(dates) => {
              setRange(dates as [Dayjs, Dayjs] | null)
              if (!dates) {
                setDateRange(undefined, undefined)
                return
              }

              setDateRange(
                dates[0]?.format('YYYY-MM-DD'),
                dates[1]?.format('YYYY-MM-DD'),
              )
            }}
          />
        }
        pagination={{
          current: params.page,
          pageSize: params.limit,
          total: data?.meta?.total ?? 0,
          onChange: (p, s) => {
            setPage(p)
            setLimit(s)
          },
          showSizeChanger: true,
          showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data`,
        }}
      />
    </>
  )
}
export default FuelAlertPage
