import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface Props {
  latitude?: number
  longitude?: number
  zoom?: number
  defaultCenter?: [number, number]
  defaultZoom?: number
}
//[-3.7200, 103.7000]
const MapController = ({
  latitude,
  longitude,
  zoom = 19,
  defaultCenter = [-3.5967, 103.8390],
  defaultZoom = 11,
}: Props) => {
  const map = useMap()

  useEffect(() => {
    requestAnimationFrame(() => {
      map.invalidateSize()

      if (latitude == null || longitude == null) {
        map.flyTo(defaultCenter, defaultZoom, { duration: 0.6 })
        return
      }

      map.flyTo([latitude, longitude], zoom, { duration: 0.6 })
    })
  }, [latitude, longitude, zoom, defaultCenter, defaultZoom, map])

  return null
}

export default MapController