import L from 'leaflet'

export type MovementStatus = 'moving' | 'idle' | 'stopped'

const STATUS_COLOR: Record<MovementStatus, string> = {
  moving:  '#52c41a',
  idle:    '#faad14',
  stopped: '#ff4d4f',
}

const STATUS_LABEL: Record<MovementStatus, string> = {
  moving:  'Bergerak',
  idle:    'Idle',
  stopped: 'Berhenti',
}

export const getStatusColor = (status: MovementStatus) =>
  STATUS_COLOR[status] ?? '#999'

export const getStatusLabel = (status: MovementStatus) =>
  STATUS_LABEL[status] ?? status

/**
 * Buat SVG icon marker kendaraan dengan warna sesuai status
 * Rotation berdasarkan heading (arah)
 */
export const createEquipmentIcon = (
  status: MovementStatus,
  heading: number = 0,
  isSelected: boolean = false
): L.DivIcon => {
  const color  = getStatusColor(status)
  const size   = isSelected ? 36 : 28
  const border = isSelected ? 3 : 2

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"
         style="transform: rotate(${heading}deg); transform-origin: center;">
      <circle cx="20" cy="20" r="18"
        fill="${color}" fill-opacity="0.15"
        stroke="${color}" stroke-width="${border}"/>
      <polygon points="20,6 28,32 20,26 12,32"
        fill="${color}" stroke="white" stroke-width="1.5"/>
    </svg>
  `

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  })
}

/**
 * Format kecepatan
 */
export const formatSpeed = (speed: number) => `${Math.round(speed)} km/h`

/**
 * Format heading ke arah kompas
 */
export const headingToCompass = (heading: number): string => {
  const dirs = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL']
  return dirs[Math.round(heading / 45) % 8]
}

/**
 * Hitung bounding box dari array posisi
 */
export const getBounds = (
  positions: { latitude: number; longitude: number }[]
): L.LatLngBounds | null => {
  if (positions.length === 0) return null
  const lats = positions.map((p) => p.latitude)
  const lngs = positions.map((p) => p.longitude)
  return L.latLngBounds(
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)]
  )
}