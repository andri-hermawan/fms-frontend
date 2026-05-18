import { Table, Input, Space, Card } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd'
import type { ReactNode } from 'react'
import { useState, useEffect, useRef } from 'react'
import useDebounce from '@/hooks/useDebounce'

interface DataTableProps<T> extends Omit<TableProps<T>, 'title'> {
  toolbar?: ReactNode
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  cardTitle?: string
}

function DataTable<T extends object>({
  toolbar,
  searchable = false,
  searchPlaceholder = 'Cari...',
  onSearch,
  cardTitle,
  ...tableProps
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearch = useDebounce(searchValue, 400)

  // Gunakan ref untuk track apakah ini render pertama
  // Hindari trigger onSearch saat pertama mount
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    onSearch?.(debouncedSearch)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  return (
    <Card
      title={cardTitle}
      styles={{ body: { padding: 0 } }}
      style={{ borderRadius: 8 }}
    >
      {(searchable || toolbar) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 16px 0',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {searchable ? (
            <Input
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              allowClear
              style={{ width: 260 }}
            />
          ) : (
            <div />
          )}

          {toolbar && <Space wrap>{toolbar}</Space>}
        </div>
      )}

      <Table
        size="middle"
        scroll={{ x: 'max-content' }}
        pagination={{
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}–${range[1]} dari ${total} data`,
          pageSizeOptions: ['10', '25', '50', '100'],
          defaultPageSize: 25,
        }}
        {...tableProps}
        style={{ padding: 16, ...tableProps.style }}
      />
    </Card>
  )
}

export default DataTable
