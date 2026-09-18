import { Select } from 'antd'

import type {
  EquipmentSearchProps,
} from '@/types/map.types'

const EquipmentSearch = ({
  value,
  options,
  onChange,
  showAllOption = false,
}: EquipmentSearchProps) => {
  // Opsi "ALL" hanya ditambahkan bila diminta. Value '' berarti tanpa
  // filter equipment_code (request tanpa parameter `search`).
  const mergedOptions = showAllOption
    ? [{ label: 'All', value: '' }, ...options]
    : options

  return (
    <Select
      allowClear={!showAllOption}
      showSearch
      size="large"
      value={showAllOption ? (value ?? '') : value || undefined}
      options={mergedOptions}
      placeholder="Search Asset..."
      style={{
        width: '100%',
      }}
      onChange={onChange}
      filterOption={(input, option) =>
        (option?.label ?? '')
          .toLowerCase()
          .includes(input.toLowerCase())
      }
    />
  )
}

export default EquipmentSearch