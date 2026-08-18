import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface Props {
  deps?: unknown
}

const MapResize = ({ deps }: Props) => {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
      // setView dihapus — invalidateSize saja cukup untuk resize container,
      // tidak perlu reset ke center/zoom saat ini (itu tugas MapController)
    }, 300)

    return () => clearTimeout(timer)
  }, [deps, map])

  return null
}

export default MapResize