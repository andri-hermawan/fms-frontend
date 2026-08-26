/**
 * Warna berdasarkan kecepatan (km/h).
 * Dipakai untuk marker/heatmap di SpeedPerSegmentPage, list, dan legend.
 */

export interface SpeedColorBand {
  /** Batas atas kecepatan (inklusif). `Infinity` untuk paling atas. */
  max: number
  color: string
  label: string
}

export const SPEED_COLOR_BANDS: SpeedColorBand[] = [
  { max: 10, color: '#000000', label: '0–10 km/h' },
  { max: 20, color: '#FFA500', label: '11–20 km/h' },
  { max: 30, color: '#55FF00', label: '21–30 km/h' },
  { max: 40, color: '#00C8FF', label: '31–40 km/h' },
  { max: 50, color: '#0055FF', label: '41–50 km/h' },
  { max: Infinity, color: '#FF0000', label: '>50 km/h' },
]

/** Ambil band (rentang) untuk sebuah kecepatan. */
export const getSpeedBand = (speed: number): SpeedColorBand => {
  const value = Number(speed) || 0
  const band = SPEED_COLOR_BANDS.find((b) => value <= b.max)
  return band ?? SPEED_COLOR_BANDS[SPEED_COLOR_BANDS.length - 1]
}

/** Ambil warna untuk sebuah kecepatan. */
export const getSpeedColor = (speed: number): string => getSpeedBand(speed).color

/**
 * Warna teks yang kontras terhadap warna kecepatan,
 * agar tetap terbaca di atas background berwarna (terang/gelap).
 */
export const getSpeedTextColor = (speed: number): string => {
  const hex = getSpeedColor(speed).replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#1f1f1f' : '#ffffff'
}
