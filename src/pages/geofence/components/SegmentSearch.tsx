// components/SegmentSearch.tsx
import { Select } from 'antd'
import type {
  SegmentSearchProps,
} from '@/types/map.types'

const SegmentSearch = ({
  value,
  options,
  onChange,
}: SegmentSearchProps) => {
  return (
    <Select
      allowClear
      showSearch
      size="large"
      value={value}
      options={options}
      placeholder="Search Segment..."
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

export default SegmentSearch