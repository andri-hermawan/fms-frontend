interface Props {
  mode: 'street' | 'satellite'
  onChange: (
    mode: 'street' | 'satellite',
  ) => void
}

const MapToolbar = ({
  mode,
  onChange,
}: Props) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 999,
        display: 'flex',
        overflow: 'hidden',
        borderRadius: 6,
        border: '1px solid #d9d9d9',
        background: '#fff',
        boxShadow:
          '0 2px 8px rgba(0,0,0,.15)',
      }}
    >
      <button
        onClick={() =>
          onChange('street')
        }
        style={{
          padding: '6px 16px',
          cursor: 'pointer',
          border: 'none',
          fontWeight: 600,
          background:
            mode === 'street'
              ? '#1677ff'
              : '#fff',
          color:
            mode === 'street'
              ? '#fff'
              : '#333',
        }}
      >
        STREET
      </button>

      <button
        onClick={() =>
          onChange('satellite')
        }
        style={{
          padding: '6px 16px',
          cursor: 'pointer',
          border: 'none',
          fontWeight: 600,
          background:
            mode === 'satellite'
              ? '#1677ff'
              : '#fff',
          color:
            mode === 'satellite'
              ? '#fff'
              : '#333',
        }}
      >
        SATELLITE
      </button>
    </div>
  )
}

export default MapToolbar