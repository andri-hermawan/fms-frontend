import L from 'leaflet'

const iconCache = new Map<string, L.Icon>()

const createLeafletIcon = (
  iconUrl: string,
  size = 32,
): L.Icon => {
  const cacheKey = `${iconUrl}:${size}`

  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!
  }

  const icon = L.icon({
    iconUrl,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    tooltipAnchor: [0, -size / 2],
  })

  iconCache.set(cacheKey, icon)

  return icon
}

export default createLeafletIcon