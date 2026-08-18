// MapLayers.tsx
import EquipmentMarker from './EquipmentMarker'
import GeofenceLayer from './GeofenceLayer'
import FitBounds from './FitBounds'
import type { MapLayersProps } from '@/types/map.types'

const MapLayers = ({
  geoJson,
  equipments,
  selectedEquipment,
  onSelectEquipment,
}: MapLayersProps) => {
  return (
    <>
      <GeofenceLayer geoJson={geoJson} />

      <EquipmentMarker
        equipments={equipments}
        selectedEquipment={selectedEquipment}
        onSelectEquipment={onSelectEquipment}
      />

      <FitBounds
        equipments={equipments}
        geoJson={geoJson}
        disabled={!!selectedEquipment} // <-- matikan FitBounds saat ada pilihan
      />
    </>
  )
}

export default MapLayers