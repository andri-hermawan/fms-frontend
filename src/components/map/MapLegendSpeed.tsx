import { useMemo } from 'react'

const SPEED_COLORS = [
  { label: '0–10 km/h', color: '#000000' },
  { label: '11–20 km/h', color: '#FFA500' },
  { label: '21–30 km/h', color: '#55FF00' },
  { label: '31–40 km/h', color: '#00C8FF' },
  { label: '41–50 km/h', color: '#0055FF' },
  { label: '>50 km/h', color: '#FF0000' },
]

const MapLegendSpeed = () => {
  const speedItems = useMemo(
    () =>
      SPEED_COLORS.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: item.color,
              border: '2px solid #fff',
              boxShadow: '0 0 4px rgba(0,0,0,.4)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: '#333',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </span>
        </div>
      )),
    [],
  )

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        zIndex: 1000,
        background: 'rgba(255,255,255,0.95)',
        padding: '6px 10px',
        borderTopRightRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,.3)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'nowrap',
        overflowX: 'auto',
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#064596',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Speed:
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        {speedItems}
      </div>
    </div>
  )
}

export default MapLegendSpeed