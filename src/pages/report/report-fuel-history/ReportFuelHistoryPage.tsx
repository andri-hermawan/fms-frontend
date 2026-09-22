import { useState, useCallback, useMemo } from 'react'
import { Button, Card, Space, Table, Tag, Typography } from 'antd'
import { FilterOutlined, DownloadOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import * as XLSX from 'xlsx'
import PageHeader from '@/components/ui/PageHeader'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'
import useFuelHistory from './useFuelHistory'
import type { Fuel, FuelFilterParams } from '@/types/fuel.types'
import { formatDate } from '@/utils/format'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

// created_at dari backend berupa UTC (contoh 2026-09-18T15:31:20.000Z).
// Tampilkan apa adanya (UTC) agar sama dengan database, bukan diubah ke timezone lokal.
dayjs.extend(utc)

// const STATUS_COLORS: Record<string, string> = {
//   'Fuel Decrease': '#cf1322',
//   'Fuel Increase': '#389e0d',
// }

// const fuelStatusColor = (status: string | null) =>
//   status ? STATUS_COLORS[status] ?? (status.toLowerCase().includes('decrease') ? '#cf1322' : '#389e0d') : '#d9d9d9'

const ReportFuelHistoryPage = () => {
  const navigate = useNavigate();
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

    const exportData = list.map((item, index) => {
      const rawLat = item.latitude ?? item.lat
      const rawLon = item.longitude ?? item.lng
      const lat = rawLat == null ? NaN : Number(rawLat)
      const lon = rawLon == null ? NaN : Number(rawLon)

      return {
        No: (page - 1) * pageSize + index + 1,
        'Asset ID':
          item.equipments?.equipment_code ??
          item.equipment_code ??
          item.equipment_id ??
          '-',
        Date: formatDate(item.created_at),
        Time: item.created_at ? dayjs.utc(item.created_at).format('HH:mm:ss') : '-',
        Shift: item.shift ?? '-',
        Engine: item.engine_status ? 'ON' : 'OFF',
        Status: item.status ?? '-',
        Speed: item.speed ?? '-',
        'Fuel Volume (liter)': item.fuel_volume ?? '-',
        'Fuel Percentage (%)':
          item.fuel_percentage != null
            ? Math.round(parseFloat(String(item.fuel_percentage)))
            : '-',
        'Fuel Diff (liter)': item.fuel_difference ?? '-',
        'Fuel Temp (c)': item.fuel_temperature ?? '-',
        'Map Segment': item.segment ?? '-',
        'Location Coordinate':
          Number.isFinite(lat) && Number.isFinite(lon)
            ? `${lat.toFixed(6)}, ${lon.toFixed(6)}`
            : '-',
        'Vessel Status': item.vessel_status ?? '-',
      }
    })

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
      title: 'Asset ID',
      width: 120,
      align: 'left',
      // fixed: 'left',
      // Nested `equipments.equipment_code` (halaman lain) atau flat `equipment_code`.
      render: (_, record) =>
        record.equipments?.equipment_code ?? record.equipment_code ?? record.equipment_id ?? '-',
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
      key: 'time',
      width: 70,
      // Pakai UTC (bukan formatTimeSecond yang lokal) agar jam sama dgn kolom Date
      // dan isi database; backend mengirim created_at dalam UTC.
      render: (v: string) => (v ? dayjs.utc(v).format('HH:mm:ss') : '-'),
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
    },
    {
      title: 'Speed',
      dataIndex: 'speed',
      width: 60,
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
      render: (_: unknown, record: Fuel) => {
        // Backend bisa mengirim number/string atau memakai key lat/lng.
        const rawLat = record.latitude ?? record.lat
        const rawLon = record.longitude ?? record.lng
        const lat = rawLat == null ? NaN : Number(rawLat)
        const lon = rawLon == null ? NaN : Number(rawLon)
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return '-'
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
        title="Report Fuel History"
        subtitle="Riwayat konsumsi fuel per tanggal, shift dan asset code"
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/report')}>
              Back to Reports
            </Button>
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
            sticky
            scroll={{ x: 'max-content' }}
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
