import { useState, useCallback, useMemo } from 'react'
import { Button, Card, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { FilterOutlined, DownloadOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import PageHeader from '@/components/ui/PageHeader'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'
import useEquipmentLogs, { useEquipmentLogsByDateShift } from '@/hooks/useEquipmentLogs'
import type { EquipmentLog } from '@/types/equipment-logs.types'
import { formatDate, formatTimeSecond } from '@/utils/format'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

const ReportEquipmentLogsPage = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(true)
  const [filterValues, setFilterValues] = useState<ReportFilterValues>({})
  const [page, setPage] = useState(1)
  const pageSize = 25

  const hasFilter = !!(filterValues.date && filterValues.shift)

  const baseParams = hasFilter
    ? {
        created_at: filterValues.date!,
        shift: filterValues.shift!,
      }
    : null

  // Bila user memilih equipment_code tertentu, gunakan endpoint
  // by-equipment-date-shift (mengirim equipment_code). Selain itu (ALL)
  // gunakan by-date-shift tanpa parameter equipment_code.
  const hasEquipment = hasFilter && !!filterValues.equipmentId
  const equipmentQuery = useEquipmentLogs(
    hasEquipment && baseParams
      ? { ...baseParams, equipment_code: filterValues.equipmentId }
      : null,
  )
  const dateShiftQuery = useEquipmentLogsByDateShift(
    !hasEquipment ? baseParams : null,
  )

  const data = hasEquipment ? equipmentQuery.data : dateShiftQuery.data
  const isLoading = hasEquipment
    ? equipmentQuery.isLoading
    : dateShiftQuery.isLoading

  const list = useMemo<EquipmentLog[]>(
    () => (data ? data.data ?? [] : []),
    [data],
  )
  const total = list.length
  const paginatedData = list.slice((page - 1) * pageSize, page * pageSize)

  const handleApply = (values: ReportFilterValues) => {
    setFilterValues(values)
    setFilterOpen(false)
    setPage(1)
  }

  const handleDownload = useCallback(() => {
    if (list.length === 0) return

    const exportData = list.map((item, index) => ({
      No: index + 1,
      'Asset ID': item.equipment_code ?? '-',
      Date: formatDate(item.created_at),
      Time: formatTimeSecond(item.created_at),
      Shift: item.shift ?? '-',
      Engine: item.engine_status ? 'ON' : 'OFF',
      Speed: item.speed,
      'Fuel Volume (liter)': item.fuel_volume,
      'Fuel Percentage (%)': item.fuel_percentage,
      'Fuel Diff (liter)': item.fuel_difference,
      'Fuel Temp (c)': item.fuel_temperature,
      'Map Segment': item.segment,
      'Location Coordinate':
        item.latitude == null || item.longitude == null
          ? '-'
          : `${item.latitude.toFixed(6)}, ${item.longitude.toFixed(6)}`,
      'Vessel Status': item.vessel_status ?? '-',
      Status: item.status,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Asset Logs')

    const dateStr = filterValues.date ?? dayjs().format('YYYY-MM-DD')
    const shiftStr = filterValues.shift ?? 'all'
    XLSX.writeFile(wb, `equipment-logs_${dateStr}_shift-${shiftStr}.xlsx`)
  }, [list, filterValues])

  const columns: ColumnsType<EquipmentLog> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      align: 'center' as const,
      fixed: 'left' as const,
      render: (_: unknown, __: EquipmentLog, index: number) =>
        (page - 1) * pageSize + index + 1,
    },
    {
      title: 'Asset ID',
      dataIndex: 'equipment_code',
      key: 'equipment_code',
      width: 120,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 60,
      render: (v: string) => formatTimeSecond(v),
    },
    {
      title: 'Shift',
      dataIndex: 'shift',
      key: 'shift',
      width: 70,
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
      render: (v: string) => (v == null ? '-' : Math.round(parseFloat(v))),
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
      render: (_: unknown, record: EquipmentLog) => {
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
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 90,
    },
  ]

  return (
    <>
      <PageHeader
        title="Report Asset History"
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/report')}>
              Back to Reports
            </Button>
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
          <Text type="secondary">Terapkan filter untuk melihat data asset history.</Text>
        ) : (
          <Table
            className="custom-table"
            rowKey="id"
            columns={columns}
            dataSource={paginatedData}
            loading={isLoading}
            sticky
            scroll={{ x: 'max-content' }}
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
        title="Asset Logs — Filter"
        dateMode="single"
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
        isLoading={isLoading}
      />
    </>
  )
}

export default ReportEquipmentLogsPage
