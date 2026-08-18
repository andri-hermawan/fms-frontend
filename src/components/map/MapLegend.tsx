// MapLegend.tsx
import { useMemo } from 'react'
import runningEmpty from '@/assets/markers/EMPTY.png'
import runningLoad from '@/assets/markers/LOADED.png'

const STATUS_COLORS = [
  { label: 'Running', color: '#008000' },
  { label: 'Idle', color: '#FFD700' },
  { label: 'Offline', color: '#000000' },
  { label: 'Stop', color: '#C71616' },
]

const VESSEL_ITEMS = [
  { label: 'Empty', icon: runningEmpty },
  { label: 'Loaded', icon: runningLoad },
]

const MapLegend = () => {
  const statusItems = useMemo(
    () =>
      STATUS_COLORS.map((item) => (
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
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: item.color,
              border: '1px solid rgba(0,0,0,.2)',
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
        Status:
      </div>

      {/* Status colors */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        {statusItems}
      </div>

      {/* Divider */}
      <span
        style={{
          width: 1,
          height: 20,
          background: '#d9d9d9',
          flexShrink: 0,
        }}
      />

      {/* Vessel load / empty icons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#064596',
            whiteSpace: 'nowrap',
          }}
        >
          Vessel:
        </span>
        {VESSEL_ITEMS.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <img
              src={item.icon}
              alt={item.label}
              style={{ width: 16, height: 16 }}
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
        ))}
      </div>

      {/* Divider */}
      <span
        style={{
          width: 1,
          height: 20,
          background: '#d9d9d9',
          flexShrink: 0,
        }}
      />

      {/* Alert red ring */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#064596',
            whiteSpace: 'nowrap',
          }}
        >
          Alert:
        </span>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            border: '2px solid #ff4d4f',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  )
}

export default MapLegend