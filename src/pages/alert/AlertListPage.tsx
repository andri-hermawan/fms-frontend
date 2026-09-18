import { useCallback, useState } from 'react'
import { Button, Space } from 'antd'
import { DownloadOutlined, FilterOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'
import { useAlerts } from './useAlert'
import usePagination from '@/hooks/usePagination'
import { formatDate, formatDate1, formatDurationMinutes, formatTimeSecond } from '@/utils/format'
import type { Alert } from '@/types/alert.types'

const today = dayjs().format('YYYY-MM-DD')

const AlertListPage = () => {
  const [filterOpen, setFilterOpen] = useState(true)
  const {
    params,
    setSearch,
    setPage,
    setLimit,
    setDateRange,
    setShift,
  } = usePagination({
    created_at: today,
    created_at_end: today,
  })
  const { data, isLoading } = useAlerts(params)
  const list = data?.data ?? []

  const handleApply = (values: ReportFilterValues) => {
    // Backend memfilter alert category lewat param `search`
    // (lihat OverspeedAlertPage: setSearch('Overspeed'))
    setSearch(values.alertCategory || values.search || '')
    setDateRange(values.dateRange?.[0], values.dateRange?.[1])
    setShift(values.shift)
    setFilterOpen(false)
  }

  const handleDownload = useCallback(() => {
    if (list.length === 0) return

    const exportData = list.map((item, index) => {
      const lat = item.latitude
      const lon = item.longitude

      return {
        No: ((params.page ?? 1) - 1) * (params.limit ?? 25) + index + 1,
        'Abnormal Alert': item.alert_categories?.alert_category_name ?? '-',
        'Asset ID': item.equipments?.equipment_code ?? '-',
        Date: formatDate1(item.created_at),
        Shift: item.shift ?? '-',
        'Start Time': formatTimeSecond(item.created_at),
        'Stop Time': formatTimeSecond(item.resolved_at),
        'Duration (minutes)': formatDurationMinutes(item.created_at, item.resolved_at),
        Speed: item.speed,
        'Fuel Volume (liter)': item.fuel_volume ?? '-',
        'Fuel Percentage (%)':
          item.fuel_percentage == null ? '-' : Math.round(item.fuel_percentage),
        'Fuel Diff (liter)': item.fuel_difference ?? '-',
        'Fuel Temp (c)': item.fuel_temperature ?? '-',
        'Map Segment': item.segment,
        'Location Coordinate':
          lat == null || lon == null ? '-' : `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        'Vessel Status': item.vessel_status ?? '-',
      }
    })

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Alerts')
    XLSX.writeFile(wb, 'alerts.xlsx')
  }, [list, params.page, params.limit])

  const columns: ColumnsType<Alert> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (_, __, index) =>
        ((params.page ?? 1) - 1) * (params.limit ?? 25) + index + 1,
    },
    {
      title: 'Abnormal Alert',
      dataIndex: 'status',
      width: 180,
      align: 'left',
      render: (_, record) => record.alert_categories?.alert_category_name ?? '-',
    },
    {
      title: 'Asset ID',
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
      title: 'Shift',
      dataIndex: 'shift',
      width: 120,
      align: 'left',
      render: (_, record) => record.shift ?? '-',
    },
    {
      title: 'Start Time',
      dataIndex: 'created_at',
      width: 120,
      align: 'center',
      render: (value) => formatTimeSecond(value),
    },
    {
      title: 'Stop Time',
      dataIndex: 'resolved_at',
      width: 120,
      align: 'center',
      render: (value) => formatTimeSecond(value),
    },
    {
      title: 'Duration (minutes)',
      width: 120,
      align: 'center',
      render: (_, record) => {
        return formatDurationMinutes(
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
      title: 'Fuel Volume (liter)',
      dataIndex: 'fuel_volume',
      width: 120,
      align: 'center',
    },
    {
      title: 'Fuel Percentage (%)',
      dataIndex: 'fuel_percentage',
      width: 120,
      align: 'center',
      render: (value) => (value == null ? '-' : Math.round(value)),
    },
    {
      title: 'Fuel Diff (liter)',
      dataIndex: 'fuel_difference',
      width: 120,
      align: 'center',
    },
    {
      title: 'Fuel Temp (c)',
      dataIndex: 'fuel_temperature',
      width: 120,
      align: 'center',
    },
    {
      title: 'Map Segment',
      dataIndex: 'segment',
      width: 140,
      align: 'left',
    },
    {
      title: 'Location Coordinate',
      key: 'location',
      width: 160,
      align: 'left',
      render: (_, record) => {
        const lat = record.latitude
        const lon = record.longitude
        if (lat == null || lon == null) return '-'
        return (
          <a
            href={`https://www.google.com/maps?q=${lat},${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#1677ff',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            {lat.toFixed(6)}, {lon.toFixed(6)}
          </a>
        )
      },
    },
    {
      title: 'Vessel Status',
      dataIndex: 'vessel_status',
      width: 140,
      align: 'left',
    },
  ]

  return (
    <>
      <PageHeader
        title="Abnormal Alerts"
        subtitle={`Total ${data?.meta?.total ?? 0} alert`}
        extra={
          <Space>
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
              Filter
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownload} disabled={list.length === 0}>
              Download
            </Button>
          </Space>
        }
      />
      <DataTable<Alert>
        rowKey="id"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
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
      <ReportFilter
        open={filterOpen}
        title="Alerts — Filter"
        dateMode="range"
        showSearch
        searchPlaceholder="Find Abnormal Alert Or Asset Code..."
        showEquipment={false}
        showAlertCategory
        initialValues={{ dateRange: [today, today] }}
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
        isLoading={isLoading}
      />
    </>
  )
}
export default AlertListPage
