// MapLegend.tsx
import { useState } from 'react'
import { Button, Modal } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import mapLegendImage from '@/assets/markers/Legend.png'

const MapLegend = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        size="middle"
        icon={<InfoCircleOutlined />}
        onClick={() => setOpen(true)}
        style={{
          position: 'absolute',
          top: 112,
          left: 10,
          zIndex: 1000,
          boxShadow: '0 1px 4px rgba(0,0,0,.3)',
        }}
      />
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={720}
        title="Legend"
      >
        <img
          src={mapLegendImage}
          alt="Legend"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </Modal>
    </>
  )
}

export default MapLegend