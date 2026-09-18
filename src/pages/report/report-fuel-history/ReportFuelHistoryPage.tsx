import { useState, useCallback, useMemo } from 'react'
import { Button, Card, Space, Table, Tag, Typography } from 'antd'
import { FilterOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import * as XLSX from 'xlsx'
import PageHeader from '@/components/ui/PageHeader'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'
import useFuelHistory from './useFuelHistory'
import type { Fuel, FuelFilterParams } from '@/types/fuel.types'

const { Text } = Typography

// created_at dari backend berupa UTC (contoh 2026-09-18T15:31:20.000Z).
// Tampilkan apa adanya (UTC) agar sama dengan database, bukan diubah ke timezone lokal.
dayjs.extend(utc)

const STATUS_COLORS: Record<string, string> = {
  'Fuel Decrease': '#cf1322',
  'Fuel Increase': '#389e0d',
}

const fuelStatusColor = (status: string | null) =>
  status ? STATUS_COLORS[status] ?? (status.toLowerCase().includes('decrease') ? '#cf1322' : '#389e0d') : '#d9d9d9'

const ReportFuelHistoryPage = () => {
  const [filterOpen, setFilterOpen] = useState(true)
  const [filterValues, setFilterValues] = useState<ReportFilterValues>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const hasFilter = !!(filterValues.dateRange?.[0] && filterValues.dateRange?.[1])

  const params = useMemo<FuelFilterParams | null>(() => {
    if (!hasFilter) return null
    return {
      start_date: filterValues.dateRange![0],
      end_date: filterValues.dateRange![1],
      page,
      limit: pageSize,
      ...(filterValues.equipmentId ? { equipment_code: filterValues.equipmentId } : {}),
      ...(filterValues.shift ? { shift: filterValues.shift } : {}),
    }
  }, [hasFilter, page, pageSize, filterValues])

  const { data, isLoading } = useFuelHistory(params)

  const list = useMemo<Fuel[]>(() => data?.data ?? [], [data])
  const total = data?.meta?.total ?? list.length

  const handleApply = (values: ReportFilterValues) => {
    setFilterValues(values)
    setFilterOpen(false)
    setPage(1)
  }

  const handleDownload = useCallback(() => {
    if (list.length === 0) return

    const exportData = list.map((item, index) => ({
      No: (page - 1) * pageSize + index + 1,
      Time: dayjs.utc(item.created_at).format('DD/MM/YYYY HH:mm:ss'),
      Shift: item.shift ?? '-',
      Equipment: item.equipments?.equipment_code ?? item.equipment_id,
      Status: item.status ?? '-',
      Vessel: item.vessel_status ?? '-',
      'Speed (km/h)': item.speed ?? '-',
      'Fuel (sensor)': item.fuel_level ?? '-',
      'Fuel (liter)': item.fuel_volume != null ? `${item.fuel_volume} L` : '-',
      'Fuel (%)': item.fuel_percentage != null ? `${Number(item.fuel_percentage).toFixed(2)} %` : '-',
      'Fuel Diff': item.fuel_difference ?? '-',
      'Fuel Temp': item.fuel_temperature ?? '-',
      Segment: item.segment ?? '-',
      'Event Type': item.event_type ?? '-',
      Engine: item.engine_status ? 'ON' : 'OFF',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Fuel History')

    const dateStr = filterValues.dateRange
      ? `${filterValues.dateRange[0]}_${filterValues.dateRange[1]}`
      : dayjs().format('YYYY-MM-DD')
    const shiftStr = filterValues.shift ?? 'all'
    XLSX.writeFile(wb, `fuel-history_${dateStr}_shift-${shiftStr}.xlsx`)
  }, [list, filterValues, page, pageSize])

  const columns: ColumnsType<Fuel> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (_: unknown, __: Fuel, index: number) =>
        (page - 1) * pageSize + index + 1,
    },
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (v: string) => dayjs.utc(v).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Shift',
      dataIndex: 'shift',
      key: 'shift',
      width: 70,
      render: (v: string | null) => v ?? '-',
    },
    {
      title: 'Equipment',
      key: 'equipment_code',
      width: 130,
      render: (_: unknown, r: Fuel) =>
        r.equipments?.equipment_code ?? r.equipment_id,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (v: string | null) => (
        <Tag color={fuelStatusColor(v)}>{v ?? '-'}</Tag>
      ),
    },
    {
      title: 'Vessel',
      dataIndex: 'vessel_status',
      key: 'vessel_status',
      width: 90,
      render: (v: string | null) => v ?? '-',
    },
    {
      title: 'Speed',
      dataIndex: 'speed',
      key: 'speed',
      width: 80,
      render: (v: number | null) => (v != null ? `${v} km/h` : '-'),
    },
    {
      title: 'Fuel (sensor)',
      dataIndex: 'fuel_level',
      key: 'fuel_level',
      width: 100,
      render: (v: number | null) => v ?? '-',
    },
    {
      title: 'Fuel (liter)',
      dataIndex: 'fuel_volume',
      key: 'fuel_volume',
      width: 100,
      render: (v: number | null) => (v != null ? `${v} L` : '-'),
    },
    {
      title: 'Fuel (%)',
      dataIndex: 'fuel_percentage',
      key: 'fuel_percentage',
      width: 90,
      render: (v: number | null) =>
        v != null ? `${Number(v).toFixed(2)} %` : '-',
    },
    {
      title: 'Fuel Diff',
      dataIndex: 'fuel_difference',
      key: 'fuel_difference',
      width: 90,
      render: (v: number | null) => v ?? '-',
    },
    {
      title: 'Fuel Temp',
      dataIndex: 'fuel_temperature',
      key: 'fuel_temperature',
      width: 90,
      render: (v: number | null) => v ?? '-',
    },
    {
      title: 'Segment',
      dataIndex: 'segment',
      key: 'segment',
      width: 120,
      render: (v: string | null) => v ?? '-',
    },
    {
      title: 'Event Type',
      dataIndex: 'event_type',
      key: 'event_type',
      width: 120,
      render: (v: string | null) => v ?? '-',
    },
    {
      title: 'Engine',
      dataIndex: 'engine_status',
      key: 'engine_status',
      width: 75,
      render: (v: boolean | null) => (
        <Tag color={v ? '#389e0d' : '#cf1322'}>{v ? 'ON' : 'OFF'}</Tag>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Report Fuel History"
        subtitle="Riwayat konsumsi fuel per asset, tanggal & shift"
        extra={
          <Space>
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
              Filter
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={list.length === 0}
            >
              Download
            </Button>
          </Space>
        }
      />
      <Card>
        {!hasFilter ? (
          <Text type="secondary">Terapkan filter untuk melihat data fuel history.</Text>
        ) : (
          <Table<Fuel>
            className="custom-table"
            rowKey="id"
            columns={columns}
            dataSource={list}
            loading={isLoading}
            scroll={{ x: 1500 }}
            size="small"
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              onChange: (p, s) => {
                setPage(p)
                setPageSize(s)
              },
              showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data`,
            }}
          />
        )}
      </Card>
      <ReportFilter
        open={filterOpen}
        title="Report Fuel History — Filter"
        dateMode="range"
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
        isLoading={isLoading}
      />
    </>
  )
}

export default ReportFuelHistoryPage
