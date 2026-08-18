import type { ColumnsType } from 'antd/es/table'

import DataTable from '@/components/ui/DataTable'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import HistoricalGraphic, { type SpeedDataPoint } from './HistoricalGraphic'

export interface EquipmentAvailability {
  key: string
  equipment_code: string
  type: string
  brand: string
  model: string
  class: string
  project_name: string
  availability: 'Ready For Use' | 'Breakdown' | 'Maintenance'
  created_at?: Date
}

const tableHeaderStyle = {
  background: '#064596',
  color: '#ffffff',
}

// ─── Dummy data speed per equipment ───────────────────────────
const dummySpeedData: Record<string, SpeedDataPoint[]> = {
  DT10202: [
    { time: '06:00', speed: 0, fuel: 90 },
    { time: '07:00', speed: 12, fuel: 86 },
    { time: '08:00', speed: 28, fuel: 78 },
    { time: '09:00', speed: 45, fuel: 65 },
    { time: '10:00', speed: 52, fuel: 52 },
    { time: '11:00', speed: 38, fuel: 44 },
    { time: '12:00', speed: 22, fuel: 38 },
    { time: '13:00', speed: 15, fuel: 33 },
  ],
  DT10203: [
    { time: '06:00', speed: 0, fuel: 100 },
    { time: '07:00', speed: 8, fuel: 95 },
    { time: '08:00', speed: 20, fuel: 88 },
    { time: '09:00', speed: 34, fuel: 74 },
    { time: '10:00', speed: 0, fuel: 74 },
    { time: '11:00', speed: 0, fuel: 74 },
    { time: '12:00', speed: 0, fuel: 74 },
    { time: '13:00', speed: 0, fuel: 74 },
  ],
}

interface EquipmentAvailabilityTableProps {
  data: EquipmentAvailability[]
}

const EquipmentAvailabilityTable = ({ data }: EquipmentAvailabilityTableProps) => {
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentAvailability | null>(null)

  const speedData = useMemo(() => {
    if (!selectedEquipment) return []
    return (
      dummySpeedData[selectedEquipment.equipment_code] ?? [
        { time: '06:00', speed: 0, fuel: 90 },
        { time: '08:00', speed: 20, fuel: 80 },
        { time: '10:00', speed: 40, fuel: 65 },
        { time: '12:00', speed: 25, fuel: 55 },
      ]
    )
  }, [selectedEquipment])

  const columns: ColumnsType<EquipmentAvailability> = [
    {
      title: 'Equipment Code',
      dataIndex: 'equipment_code',
      width: 160,
    },
    {
      title: 'Type',
      dataIndex: 'type',
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
    },
    {
      title: 'Model',
      dataIndex: 'model',
    },
    {
      title: 'Class',
      dataIndex: 'class',
    },
    {
      title: 'Project',
      dataIndex: 'project_name',
    },
    {
      title: 'Availability',
      dataIndex: 'availability',
      width: 140,
      align: 'center',
      render: (value: EquipmentAvailability['availability']) => {
        const color =
          value === 'Ready For Use'
            ? 'green'
            : value === 'Breakdown'
              ? 'red'
              : 'orange'
        return <span style={{ color, fontWeight: 600 }}>{value}</span>
      },
    },
    // {
    //   title: 'Date',
    //   dataIndex: 'created_at',
    //   width: 180,
    //   render: (value: Date | undefined) => {
    //     return value ? dayjs(value).format('DD MMM YYYY') : '-'
    //   },
    // },
  ]

  const handleRowClick = (record: EquipmentAvailability) => {
    setSelectedEquipment(record)
    // message.info(
    //   `Equipment ${record.equipment_code} (${record.model}) terpilih - Availability ${record.availability}%`,
    // )
  }

  return (
    <>
    <DataTable<EquipmentAvailability>
      dataSource={data}
      columns={columns}
      rowKey="key"
      searchable={false}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        style: { cursor: 'pointer' },
      })}
      locale={{ emptyText: 'Tidak ada data equipment' }}
      components={{
        header: {
          cell: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
            <th {...props} style={{ ...props.style, ...tableHeaderStyle }} />
          ),
        },
      }}
    />

    {selectedEquipment && (
      <HistoricalGraphic
        equipmentCode={selectedEquipment.equipment_code}
        data={speedData}
      />
    )}
    </>
  )
}

export default EquipmentAvailabilityTable