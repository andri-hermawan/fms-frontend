import { Tag } from 'antd'

type StatusVariant =
  | 'active'
  | 'inactive'
  | 'maintenance'
  | 'online'
  | 'offline'
  | 'unassigned'
  | 'on_duty'
  | 'moving'
  | 'idle'
  | 'stopped'
  | 'high'
  | 'medium'
  | 'low'
  | 'critical'

const STATUS_CONFIG: Record<
  StatusVariant,
  { color: string; label: string }
> = {
  active:      { color: 'success',  label: 'Aktif' },
  inactive:    { color: 'default',  label: 'Nonaktif' },
  maintenance: { color: 'warning',  label: 'Perawatan' },
  online:      { color: 'success',  label: 'Online' },
  offline:     { color: 'error',    label: 'Offline' },
  unassigned:  { color: 'default',  label: 'Belum Dipasang' },
  on_duty:     { color: 'processing', label: 'Bertugas' },
  moving:      { color: 'processing', label: 'Bergerak' },
  idle:        { color: 'warning',  label: 'Idle' },
  stopped:     { color: 'default',  label: 'Berhenti' },
  high:        { color: 'orange',   label: 'Tinggi' },
  medium:      { color: 'gold',     label: 'Sedang' },
  low:         { color: 'blue',     label: 'Rendah' },
  critical:    { color: 'red',      label: 'Kritis' },
}

interface StatusBadgeProps {
  status: StatusVariant
  /** Override label default */
  label?: string
}

const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] ?? { color: 'default', label: status }
  return (
    <Tag color={config.color}>
      {label ?? config.label}
    </Tag>
  )
}

export default StatusBadge
