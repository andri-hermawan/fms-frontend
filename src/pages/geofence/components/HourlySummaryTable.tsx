import { PassingSummaryItem } from '@/types/geofence.types'
import { Card, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface Props {
  data: PassingSummaryItem[]
  shift?: string
}

const HourlySummaryTable = ({ data, shift }: Props) => {
  const columns: ColumnsType<PassingSummaryItem> = [
    {
      title: 'Hour',
      dataIndex: 'hour',
      width: '28%',
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'In',
      dataIndex: 'in',
      width: '24%',
      align: 'center',
      render: (value) => (
        <Tag color="green" style={{ margin: 0, width: '100%', textAlign: 'center' }}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Out',
      dataIndex: 'out',
      width: '24%',
      align: 'center',
      render: (value) => (
        <Tag color="red" style={{ margin: 0, width: '100%', textAlign: 'center' }}>
          {value}
        </Tag>
      ),
    },
    // {
    //   title: 'Total',
    //   dataIndex: 'total',
    //   width: '24%',
    //   align: 'center',
    //   render: (value) => (
    //     <Tag color="blue" style={{ margin: 0, width: '100%', textAlign: 'center' }}>
    //       {value}
    //     </Tag>
    //   ),
    // },
  ]

  return (
    <Card
      title={`HOURLY PASSING SUMMARY${shift ? ` - ${shift}` : ''}`}
      size="small"
      style={{
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
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
          rowKey="hour"
          columns={columns}
          dataSource={data}
          pagination={false}
          size="small"
          tableLayout="fixed"
          sticky
          locale={{ emptyText: 'No hourly passing summary available' }}
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
          Hours : <b>{data.length}</b>
        </span>

        <span>
          Total :
          <b> {data.reduce((sum, item) => sum + item.total, 0)}</b>
        </span>
      </div>
    </Card>
  )
}

export default HourlySummaryTable