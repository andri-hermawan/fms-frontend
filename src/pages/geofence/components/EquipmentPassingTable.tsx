import { PassingItem } from '@/types/geofence.types'
import { Card, Tag } from 'antd'

interface Props {
  data: PassingItem[]
}

const EquipmentPassingTable = ({ data }: Props) => {
  // console.log("data passing", data)
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
        {data.length ? data.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid #f0f0f0',
              fontSize: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                minWidth: 0,
                fontWeight: 600,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.equipment_code}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.segment || '-'}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginTop: 4,
                color: '#666',
              }}
            >
              <span>{item.time}</span>
              <Tag color={item.event === 'IN' ? 'green' : 'red'} style={{ margin: 0 }}>
                {item.event}
              </Tag>
            </div>
          </div>
        )) : (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: '#999', fontSize: 12 }}>
            No equipment passing available
          </div>
        )}
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