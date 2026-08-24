import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

interface Props {
  latitude?: number
  longitude?: number
  zoom?: number
  defaultCenter?: [number, number]
  defaultZoom?: number
}

const MapController = ({
  latitude,
  longitude,
  zoom = 19,
  defaultCenter = [-3.5967, 103.839],
  defaultZoom = 11,
}: Props) => {
  const map = useMap()
  const initialized = useRef(false)
  const prevKey = useRef<string | undefined>(undefined)

  useEffect(() => {
    const key = `${latitude ?? 'null'}_${longitude ?? 'null'}`

    // First mount: fly to default center or selected equipment
    if (!initialized.current) {
      initialized.current = true
      prevKey.current = key
      requestAnimationFrame(() => {
        map.invalidateSize()
        if (latitude != null && longitude != null) {
          map.flyTo([latitude, longitude], zoom, { duration: 0.6 })
        } else {
          map.flyTo(defaultCenter, defaultZoom, { duration: 0.6 })
        }
      })
      return
    }

    // Only fly when target actually changes
    if (key === prevKey.current) return
    prevKey.current = key

    requestAnimationFrame(() => {
      map.invalidateSize()
      if (latitude != null && longitude != null) {
        map.flyTo([latitude, longitude], zoom, { duration: 0.6 })
      } else {
        // User cleared selection → fly back to default center
        map.flyTo(defaultCenter, defaultZoom, { duration: 0.6 })
      }
    })
  }, [latitude, longitude, zoom, defaultCenter, defaultZoom, map])

  return null
}

export default MapController