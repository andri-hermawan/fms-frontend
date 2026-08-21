interface AlertSummaryProps {
  count: number
}

const AlertSummary = ({ count }: AlertSummaryProps) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      flexShrink: 0,
      borderBottom: '1px solid #f0f0f0',
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: 0.4,
      background: '#064596',
      color: '#fff',
      borderRadius: 8,
    }}
  >
    <span>Alert List</span>
    <span>
      {count} alert
    </span>
  </div>
)

export default AlertSummary