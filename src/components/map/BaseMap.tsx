import { MapContainer, TileLayer } from 'react-leaflet'
import { useState } from 'react'
import MapToolbar from './MapToolbar'
// import DrawControl from './DrawControl'
import type { BaseMapProps } from '@/types/map.types'

const BaseMap = ({
  children,
  center = [-3.656, 103.809],
  zoom = 10,
  showToolbar = true,
  // enableDraw = true,
}: BaseMapProps) => {
  const [mode, setMode] = useState<'street' | 'satellite'>('street')

  const tileUrl =
    mode === 'street'
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {showToolbar && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1000,
            maxWidth: 'calc(100% - 24px)',
          }}
        >
          <MapToolbar mode={mode} onChange={setMode} />
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        maxZoom={19}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <TileLayer url={tileUrl} maxZoom={19} />
        {/* {enableDraw && (
            <DrawControl editable />
        )} */}
        {children}
      </MapContainer>
    </div>
  )
}

export default BaseMap