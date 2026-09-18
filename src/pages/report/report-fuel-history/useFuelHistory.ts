import { useQuery } from '@tanstack/react-query'
import fuelApi from '@/services/api/fuel.api'
import type { FuelFilterParams } from '@/types/fuel.types'

export const FUEL_HISTORY_KEY = 'fuel-history'

/**
 * Riwayat fuel untuk Report Fuel History.
 * Endpoint: `/fms/api/fuels/filter?start_date&end_date&equipment_code&shift&page&limit`
 *
 * Query tidak dijalankan saat `params` = null sehingga tabel tetap kosong
 * sebelum filter diterapkan.
 */
export const useFuelHistory = (params: FuelFilterParams | null) =>
  useQuery({
    queryKey: [FUEL_HISTORY_KEY, params],
    queryFn: () => fuelApi.getByFilter(params as FuelFilterParams).then((r) => r.data),
    enabled: !!params,
  })

export default useFuelHistory
