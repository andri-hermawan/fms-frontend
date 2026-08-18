import L from 'leaflet'

const iconCache = new Map<string, L.Icon>()

const createLeafletIcon = (
  iconUrl: string,
): L.Icon => {
  if (iconCache.has(iconUrl)) {
    return iconCache.get(iconUrl)!
  }

  const icon = L.icon({
    iconUrl,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
    tooltipAnchor: [0, -10],
  })

  iconCache.set(iconUrl, icon)

  return icon
}

export default createLeafletIcon