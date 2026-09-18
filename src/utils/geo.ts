/**
 * Hitung jarak antara dua koordinat (Haversine formula)
 * @returns jarak dalam meter
 */
export const haversineDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371000 // radius bumi dalam meter
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Cek apakah titik berada dalam polygon (ray casting)
 */
export const isPointInPolygon = (
  point: [number, number],
  polygon: [number, number][]
): boolean => {
  const [px, py] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

/**
 * Convert derajat heading ke arah kompas
 */
export const headingToCompass = (heading: number): string => {
  const directions = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL']
  return directions[Math.round(heading / 45) % 8]
}

/**
 * Format koordinat untuk display
 */
export const formatCoordinate = (lat: number, lng: number): string =>
  `${lat.toFixed(6)}, ${lng.toFixed(6)}`

/**
 * Parse nilai geometri menjadi pasangan [latitude, longitude].
 * Mendukung:
 * - WKT PostGIS: `POINT(lon lat)` atau `POINT(lon lat)`
 * - GeoJSON: `{ type: 'Point', coordinates: [lon, lat] }`
 * - String sederhana: `"lat, lon"`
 * Mengembalikan null bila tidak dapat diparse.
 */
export const parseGeometryPoint = (value: unknown): [number, number] | null => {
  if (value == null || value === '') return null

  // GeoJSON object
  if (typeof value === 'object') {
    const geo = value as { type?: string; coordinates?: number[] }
    if (geo?.type === 'Point' && Array.isArray(geo.coordinates)) {
      const [lon, lat] = geo.coordinates
      if (Number.isFinite(lon) && Number.isFinite(lat)) return [lat, lon]
    }
    return null
  }

  const str = String(value).trim()

  // WKT: POINT(lon lat)
  const wktMatch = /^POINT\s*\(\s*([-\d.]+\s+[-\d.]+)\s*\)\s*$/i.exec(str)
  if (wktMatch) {
    const [lon, lat] = wktMatch[1].split(/\s+/).map(Number)
    if (Number.isFinite(lon) && Number.isFinite(lat)) return [lat, lon]
  }

  // String sederhana: "lat, lon"
  const pair = str.split(',').map((s) => Number(s.trim()))
  if (pair.length === 2 && pair.every((n) => Number.isFinite(n))) {
    return [pair[0], pair[1]]
  }

  return null
}

/**
 * Format nilai geometri (WKT / GeoJSON / "lat, lon") menjadi
 * string koordinat `lat, long` untuk ditampilkan.
 */
export const formatGeometryCoordinate = (value: unknown): string => {
  const point = parseGeometryPoint(value)
  if (!point) return '-'
  const [lat, lon] = point
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`
}
