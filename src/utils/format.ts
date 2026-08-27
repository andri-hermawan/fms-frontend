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

/**
 * Durasi antara dua datetime dalam satuan menit
 * Contoh:
 * Start : 7:13:30
 * Stop  : 7:14:30
 * Hasil : 1.00 menit
 */
export const formatDurationMinutes = (
  start?: string | Date,
  end?: string | Date,
): string => {
  if (!start || !end) return '-'

  const diffMinutes = diffInMinutes(start, end)

  if (diffMinutes < 0) return '-'

  return diffMinutes.toFixed(2)
}

/**
 * Hitung selisih waktu dalam menit (desimal).
 * Mendukung datetime penuh maupun string waktu "H:mm:ss".
 */
const diffInMinutes = (
  start: string | Date,
  end: string | Date,
): number => {
  const startTime = parseTime(start)
  const endTime = parseTime(end)

  if (startTime === null || endTime === null) return -1

  return (endTime - startTime) / 60000
}

/**
 * Parse datetime atau waktu "H:mm:ss" menjadi timestamp (ms).
 * Mengembalikan null jika tidak valid.
 */
const parseTime = (value: string | Date): number | null => {
  const parsed = dayjs.utc(value)

  if (parsed.isValid()) return parsed.valueOf()

  const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(String(value))

  if (!match) return null

  const h = Number(match[1])
  const m = Number(match[2])
  const s = Number(match[3] ?? 0)

  if (h > 23 || m > 59 || s > 59) return null

  return (h * 3600 + m * 60 + s) * 1000
}

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('id-ID').format(num)

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)