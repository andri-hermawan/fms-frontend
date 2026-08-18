import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input, Select } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'

import PageHeader from '@/components/ui/PageHeader'
import CurrentDateDisplay from '@/components/ui/CurrentDateDisplay'
import EquipmentAvailabilityTable, {
  type EquipmentAvailability,
} from './components/EquipmentAvailabilityTable'

// ─── Dummy data ───────────────────────────────────────────────
const dummyData: EquipmentAvailability[] = [
  { key: '1', equipment_code: 'DT10202', type: 'Dump Truck', brand: 'Hino', model: 'FM260JD', class: '30', project_name: 'Coal Hauling Road', availability: 'Ready For Use', created_at: new Date('2026-08-14 13:43:26.013777') },
  { key: '2', equipment_code: 'DT10203', type: 'Dump Truck', brand: 'Hino', model: 'FM260JD', class: '30', project_name: 'Coal Hauling Road', availability: 'Ready For Use', created_at: new Date('2026-08-14 13:43:26.013777') },
  { key: '3', equipment_code: 'DT10204', type: 'Dump Truck', brand: 'Hino', model: 'FM260JD', class: '30', project_name: 'Coal Hauling Road', availability: 'Breakdown', created_at: new Date('2026-08-14 13:43:26.013777') },
]

const GraphicPage = () => {
  const [searchParams] = useSearchParams()

  const initialCode = searchParams.get('equipmentCode') ?? ''
  const initialDate = searchParams.get('date')
  const initialShift = searchParams.get('shift') ?? '1'

  const [searchCode, setSearchCode] = useState(initialCode)
  const [selectedDate, setSelectedDate] = useState<Dayjs>(
    initialDate && dayjs(initialDate).isValid() ? dayjs(initialDate) : dayjs(),
  )
  const [selectedShift, setSelectedShift] = useState(initialShift)

  const filteredData = useMemo(() => {
    const keyword = searchCode.trim().toLowerCase()

    return dummyData.filter((row) => {
      // Filter by search code
      if (
        keyword &&
        !row.equipment_code.toLowerCase().includes(keyword)
      ) {
        return false
      }

      // Filter by date (created_at)
      if (selectedDate && row.created_at) {
        const rowDate = dayjs(row.created_at).format('YYYY-MM-DD')
        const selected = selectedDate.format('YYYY-MM-DD')
        if (rowDate !== selected) return false
      }

      return true
    })
  }, [searchCode, selectedDate])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <PageHeader
        title="Graphic"
        subtitle="Informasi Equipment Availability"
      />

      {/* Filter bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(150px,170px) minmax(100px,120px)',
          gap: 12,
          margin: '16px 0',
          flexShrink: 0,
          minWidth: 0,
        }}
      >
        <Input
          allowClear
          placeholder="Search equipment code..."
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          size="large"
        />

        <CurrentDateDisplay
          value={selectedDate}
          onChange={(date) => date && setSelectedDate(date)}
        />

        <Select
          value={selectedShift}
          onChange={setSelectedShift}
          size="large"
          options={[
            { label: 'Shift 1', value: '1' },
            { label: 'Shift 2', value: '2' },
          ]}
        />
      </div>

      <EquipmentAvailabilityTable data={filteredData} />
    </div>
  )
}

export default GraphicPage
