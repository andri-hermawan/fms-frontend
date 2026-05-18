import { create } from 'zustand'
import type { VehiclePosition } from '@/services/api/tracking.api'

interface TrackingState {
  positions: Record<string, VehiclePosition>
  selectedEquipmentId: string | null
  isConnected: boolean
  lastUpdated: Date | null

  setPosition: (pos: VehiclePosition) => void
  setBulkPositions: (positions: VehiclePosition[]) => void
  setSelectedEquipment: (id: string | null) => void
  setConnected: (connected: boolean) => void
  clearPositions: () => void
}

export const useTrackingStore = create<TrackingState>((set) => ({
  positions: {},
  selectedEquipmentId: null,
  isConnected: false,
  lastUpdated: null,

  setPosition: (pos) =>
    set((state) => ({
      positions: { ...state.positions, [pos.equipment_id]: pos },
      lastUpdated: new Date(),
    })),

  setBulkPositions: (positions) =>
    set({
      positions: Object.fromEntries(positions.map((p) => [p.equipment_id, p])),
      lastUpdated: new Date(),
    }),

  setSelectedEquipment: (id) =>
    set({ selectedEquipmentId: id }),

  setConnected: (connected) =>
    set({ isConnected: connected }),

  clearPositions: () =>
    set({ positions: {}, lastUpdated: null }),
}))

export const selectAllPositions = (state: TrackingState) =>
  Object.values(state.positions)

export const selectSelectedPosition = (state: TrackingState) =>
  state.selectedEquipmentId
    ? state.positions[state.selectedEquipmentId] ?? null
    : null