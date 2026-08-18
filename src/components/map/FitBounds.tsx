// FitBounds.tsx
import { useEffect, useRef } from 'react'
import { GeoJSON, LatLngBounds } from 'leaflet'
import { useMap } from 'react-leaflet'
import type { FitBoundsProps } from '@/types/map.types'

interface Props extends FitBoundsProps {
  disabled?: boolean
}

const FitBounds = ({ geoJson, equipments, disabled }: Props) => {
  const map = useMap()
  const initialized = useRef(false)

  useEffect(() => {
    if (disabled) return // <-- skip total kalau ada equipment terpilih

    const bounds = new LatLngBounds([])

    if (geoJson) {
      const layer = new GeoJSON(geoJson)
      if (layer.getBounds().isValid()) {
        bounds.extend(layer.getBounds())
      }
    }

    equipments.forEach((item) => {
      if (item.latitude !== 0 && item.longitude !== 0) {
        bounds.extend([item.latitude, item.longitude])
      }
    })

    if (!bounds.isValid()) return

    if (!initialized.current) {
      initialized.current = true
      map.fitBounds(bounds, { padding: [30, 30] })
      return
    }

    map.flyToBounds(bounds, { padding: [30, 30], duration: 0.5 })
  }, [geoJson, equipments, map, disabled])

  return null
}

export default FitBounds