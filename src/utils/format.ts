import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/id'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.locale('id')

export const formatDate = (
  date: string | Date,
  format = 'DD MMM YYYY',
): string => {
  if (!date) return '-'
  return dayjs.utc(date).format(format)
}

export const formatDateTime = (date: string | Date): string => {
  if (!date) return '-'
  return dayjs.utc(date).format('DD MMM YYYY HH:mm')
}

export const formatTime = (date?: string | Date): string => {
  if (!date) return '-'
  return dayjs(date).format('HH:mm')
}

export const formatRelative = (date: string | Date): string => {
  if (!date) return '-'
  return dayjs.utc(date).fromNow()
}

export const formatSpeed = (kmh: number): string =>
  `${kmh.toFixed(0)} km/h`

export const formatFuelLevel = (percent: number): string =>
  `${percent.toFixed(1)}%`

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${meters.toFixed(0)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

/**
 * Durasi dari jumlah menit
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} menit`

  const h = Math.floor(minutes / 60)
  const m = minutes % 60

  return m > 0 ? `${h} jam ${m} menit` : `${h} jam`
}

/**
 * Durasi antara dua datetime
 * Contoh:
 * Start : 09:17
 * Stop  : 16:00
 * Hasil : 06:43
 */
export const formatDurationBetween = (
  start?: string | Date,
  end?: string | Date,
): string => {
  if (!start || !end) return '-'

  const startTime = dayjs.utc(start)
  const endTime = dayjs.utc(end)

  if (!startTime.isValid() || !endTime.isValid()) {
    return '-'
  }

  const diff = endTime.diff(startTime, 'minute')

  if (diff < 0) return '-'

  const hours = Math.floor(diff / 60)
  const minutes = diff % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('id-ID').format(num)

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)