interface Props {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

const SegmentTooltipControl = ({ enabled, onChange }: Props) => {
  return (
    <div
      className="leaflet-top leaflet-left"
      style={{ pointerEvents: 'none', marginTop: 120 }}
    >
      <div className="leaflet-control" style={{ pointerEvents: 'auto' }}>
        <button
          type="button"
          onClick={() => onChange(!enabled)}
          title={enabled ? 'Hide all segment labels' : 'Show all segment labels'}
          aria-pressed={enabled}
          style={{
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            background: enabled ? '#1677ff' : '#fff',
            color: enabled ? '#fff' : '#333',
            boxShadow: '0 2px 8px rgba(0,0,0,.2)',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            padding: '7px 10px',
            whiteSpace: 'nowrap',
          }}
        >
          {enabled ? 'Hide Segment Labels' : 'Show Segment Labels'}
        </button>
      </div>
    </div>
  )
}

export default SegmentTooltipControl
