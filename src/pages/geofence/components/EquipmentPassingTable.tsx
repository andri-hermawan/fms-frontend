import { PassingItem } from '@/types/geofence.types'
import { Card, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface Props {
  data: PassingItem[]
}

const EquipmentPassingTable = ({ data }: Props) => {
  const columns: ColumnsType<PassingItem> = [
    {
      title: 'Equipment',
      dataIndex: 'equipment_code',
      width: '45%',
      ellipsis: true,
    },
    {
      title: 'Time',
      dataIndex: 'time',
      width: '30%',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'event',
      width: '25%',
      align: 'center',
      render: (value) => (
        <Tag
          color={value === 'IN' ? 'green' : 'red'}
          style={{ margin: 0, width: '100%', textAlign: 'center' }}
        >
          {value}
        </Tag>
      ),
    },
  ]

  return (
    <Card
      title="EQUIPMENT PASSING"
      size="small"
      style={{
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        border: '1px solid #064596',
        
      }}
      styles={{
        header: { 
          padding: '12px 16px',
          flexShrink: 0,
          borderBottom: '1px solid #f0f0f0',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.4,
          background: '#064596', color: '#fff'
        },
        body: {
          padding: 0,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          
        },
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={false}
          size="small"
          tableLayout="fixed"
          sticky
          locale={{ emptyText: 'No equipment passing available' }}
        />
      </div>

      <div
        style={{
          padding: '6px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid #f0f0f0',
          fontSize: 12,
          background: '#fafafa',
          flexShrink: 0,
        }}
      >
        <span>
          Total : <b>{data.length}</b>
        </span>

        <span>
          Last : <b>{data.length ? data.reduce((a, b) => a.time > b.time ? a : b).time : '-'}</b>
        </span>
      </div>
    </Card>
  )
}

export default EquipmentPassingTable