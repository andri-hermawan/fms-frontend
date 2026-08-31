import { useState, useCallback } from 'react'
import { Button, Card, Space, Table, Tag, Typography } from 'antd'
import { FilterOutlined, DownloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import PageHeader from '@/components/ui/PageHeader'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'
import { useEquipmentLogsByDateShift } from '@/hooks/useEquipmentLogs'
import type { EquipmentLog } from '@/types/equipment-logs.types'

const { Text } = Typography

const ReportEquipmentLogsPage = () => {
  const [filterOpen, setFilterOpen] = useState(true)
  const [filterValues, setFilterValues] = useState<ReportFilterValues>({})
  const [page, setPage] = useState(1)
  const pageSize = 25

  const hasFilter = !!(filterValues.dateRange?.[0] && filterValues.shift)

  const queryParams = hasFilter
    ? {
        created_at: filterValues.dateRange![0],
        shift: filterValues.shift!,
        equipment_code: filterValues.equipmentId,
      }
    : null

  const { data, isLoading } = useEquipmentLogsByDateShift(queryParams)

  const list: EquipmentLog[] = data
    ? (data as any)?.data ?? (Array.isArray(data) ? data : [])
    : []
  const total = list.length
  const paginatedData = list.slice((page - 1) * pageSize, page * pageSize)

  const handleApply = (values: ReportFilterValues) => {
    setFilterValues(values)
    setFilterOpen(false)
    setPage(1)
  }

  const handleDownload = useCallback(() => {
    if (list.length === 0) return

    const exportData = list.map((item) => ({
      Time: dayjs(item.time).format('DD/MM/YYYY HH:mm:ss'),
      Equipment: item.equipment_code,
      Status: item.status,
      Vessel: item.vessel_status || '-',
      'Speed (km/h)': item.speed,
      'Fuel (%)': item.fuel_percentage,
      Segment: item.segment,
      Latitude: item.latitude,
      Longitude: item.longitude,
      Engine: item.engine_status ? 'ON' : 'OFF',
      Shift: item.shift,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Equipment Logs')

    const dateStr = filterValues.dateRange?.[0] ?? dayjs().format('YYYY-MM-DD')
    const shiftStr = filterValues.shift ?? 'all'
    XLSX.writeFile(wb, `equipment-logs_${dateStr}_shift-${shiftStr}.xlsx`)
  }, [list, filterValues])

  const columns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 160,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Equipment',
      dataIndex: 'equipment_code',
      key: 'equipment_code',
      width: 130,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      // render: (v: string) => (
      //   <Tag color={STATUS_COLORS[v] || '#d9d9d9'}>{v}</Tag>
      // ),
    },
    {
      title: 'Vessel',
      dataIndex: 'vessel_status',
      key: 'vessel_status',
      width: 90,
      // render: (v: string) =>
      //   v ? <Tag color={VESSEL_COLORS[v] || '#d9d9d9'}>{v}</Tag> : '-',
    },
    {
      title: 'Speed',
      dataIndex: 'speed',
      key: 'speed',
      width: 80,
      render: (v: string) => `${v} km/h`,
    },
    {
      title: 'Fuel',
      dataIndex: 'fuel_percentage',
      key: 'fuel_percentage',
      width: 80,
      render: (v: string) => `${v} %`,
    },
    {
      title: 'Segment',
      dataIndex: 'segment',
      key: 'segment',
      width: 120,
    },
    {
      title: 'Location',
      key: 'location',
      width: 160,
      render: (_: unknown, r: EquipmentLog) =>
        `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`,
    },
    {
      title: 'Engine',
      dataIndex: 'engine_status',
      key: 'engine_status',
      width: 75,
      render: (v: boolean) => (
        <Tag color={v ? '#389e0d' : '#cf1322'}>{v ? 'ON' : 'OFF'}</Tag>
      ),
    },
    {
      title: 'Shift',
      dataIndex: 'shift',
      key: 'shift',
      width: 70,
    },
  ]

  return (
    <>
      <PageHeader
        title="Equipment Logs"
        subtitle="Riwayat log equipment per tanggal & shift"
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
      <Card>
        {!hasFilter ? (
          <Text type="secondary">Terapkan filter untuk melihat data equipment logs.</Text>
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={paginatedData}
            loading={isLoading}
            scroll={{ x: 1200 }}
            size="small"
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: false,
              onChange: (p) => setPage(p),
            }}
          />
        )}
      </Card>
      <ReportFilter
        open={filterOpen}
        title="Equipment Logs — Filter"
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
        isLoading={isLoading}
      />
    </>
  )
}

export default ReportEquipmentLogsPage
