import dayjs from 'dayjs'

export const formatDate = (date: string | Date, format = 'DD MMM YYYY'): string =>
  dayjs(date).format(format)

export const formatDateTime = (date: string | Date): string =>
  dayjs(date).format('DD MMM YYYY, HH:mm')

export const formatRelative = (date: string | Date): string =>
  dayjs(date).fromNow()

export const formatSpeed = (kmh: number): string =>
  `${kmh.toFixed(0)} km/h`

export const formatFuelLevel = (percent: number): string =>
  `${percent.toFixed(1)}%`

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${meters.toFixed(0)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} menit`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} jam ${m} menit` : `${h} jam`
}

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('id-ID').format(num)

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
