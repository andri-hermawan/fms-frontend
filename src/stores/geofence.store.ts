import { create } from 'zustand'

import type {
  PassingItem,
  PassingSummaryItem,
} from '@/types/geofence.types'

interface GeofenceState {
  passing: PassingItem[]
  summary: PassingSummaryItem[]

  setPassing: (
    data: PassingItem[],
  ) => void

  setSummary: (
    data: PassingSummaryItem[],
  ) => void
}

export const useGeofenceStore =
  create<GeofenceState>((set) => ({
    passing: [],
    summary: [],

    setPassing: (passing) =>
      set({ passing }),

    setSummary: (summary) =>
      set({ summary }),
  }))