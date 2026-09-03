// MapLegend.tsx
import { Button, Popover } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import mapLegendImage from '@/assets/markers/Legend.png'

const MapLegend = () => {
  return (
    <Popover
      trigger="hover"
      placement="rightTop"
      title="Legend"
      content={
        <img
          src={mapLegendImage}
          alt="Legend"
          style={{ width: 640, height: 'auto', display: 'block' }}
        />
      }
    >
      <span
        style={{
          position: 'absolute',
          top: 112,
          left: 10,
          zIndex: 1000,
          display: 'inline-block',
        }}
      >
        <Button
          size="middle"
          icon={<InfoCircleOutlined />}
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,.3)' }}
        />
      </span>
    </Popover>
  )
}

export default MapLegend