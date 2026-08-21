import { Select } from 'antd'

import type {
  EquipmentSearchProps,
} from '@/types/map.types'

const EquipmentSearch = ({
  value,
  options,
  onChange,
}: EquipmentSearchProps) => {
  return (
    <Select
      allowClear
      showSearch
      size="large"
      value={value || undefined}
      options={options}
      placeholder="Search Equipment..."
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