import { create } from 'zustand'
import type {
  EquipmentLiveStatus,
  EquipmentStatusSummary,
} from '@/types/equipment-status.types'

interface EquipmentStatusState {
  positions: Record<string, EquipmentLiveStatus>
  selectedEquipmentId: string | null
  isConnected: boolean
  lastUpdated: Date | null

  setBulkPositions: (list: EquipmentLiveStatus[]) => void
  setPosition: (pos: EquipmentLiveStatus) => void
  setSelectedEquipment: (id: string | null) => void
  setConnected: (val: boolean) => void
  clear: () => void
}

export const useEquipmentStatusStore = create<EquipmentStatusState>((set) => ({
  positions: {},
  selectedEquipmentId: null,
  isConnected: false,
  lastUpdated: null,

  setBulkPositions: (list) => {
    const map: Record<string, EquipmentLiveStatus> = {}

    for (const item of list) {
      map[item.equipment_id] = item
    }

    set({
      positions: map,
      lastUpdated: new Date(),
    })
  },

  setPosition: (pos) =>
    set((state) => ({
      positions: {
        ...state.positions,
        [pos.equipment_id]: pos,
      },
      lastUpdated: new Date(),
    })),

  setSelectedEquipment: (id) =>
    set({
      selectedEquipmentId: id,
    }),

  setConnected: (val) =>
    set({
      isConnected: val,
    }),

  clear: () =>
    set({
      positions: {},
      lastUpdated: null,
    }),
}))

// ----------------------
// Selectors
// ----------------------

export const selectPositions = (s: EquipmentStatusState) => s.positions

export const selectSelectedPosition = (s: EquipmentStatusState) =>
  s.selectedEquipmentId
    ? s.positions[s.selectedEquipmentId] ?? null
    : null

export const selectSummary = (
  s: EquipmentStatusState,
): EquipmentStatusSummary => {
  const list = Object.values(s.positions)

  return {
    total: list.length,
    moving: list.filter((x) => x.status === 'MOVING').length,
    idle: list.filter((x) => x.status === 'IDLE').length,
    stopped: list.filter((x) => x.status === 'OFFLINE').length,
  }
}