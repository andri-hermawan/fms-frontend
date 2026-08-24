// ResetViewButton.tsx
import { Button } from 'antd'
import { AimOutlined } from '@ant-design/icons'
import { useMap } from 'react-leaflet'

interface Props {
  defaultCenter?: [number, number]
  defaultZoom?: number
}

const ResetViewButton = ({
  defaultCenter = [-3.5967, 103.839],
  defaultZoom = 11,
}: Props) => {
  const map = useMap()

  return (
    <Button
      size="medium"
      icon={<AimOutlined />}
      onClick={() =>
        map.flyTo(defaultCenter, defaultZoom, { duration: 0.6 })
      }
      style={{
        position: 'absolute',
        top: 80,
        left: 10,
        zIndex: 1000,
        boxShadow: '0 1px 4px rgba(0,0,0,.3)',
      }}
    >
      {/* Default Zoom */}
    </Button>
  )
}

export default ResetViewButton