import { create } from 'zustand'
import type { Alert } from '@/types/alert.types'

interface AlertState {
  activeAlerts: Alert[]
  unreadCount: number

  addAlert: (alert: Alert) => void
  markAllAsRead: () => void
  markAsRead: (alertId: string) => void
  clearAlerts: () => void
}

export const useAlertStore = create<AlertState>((set) => ({
  activeAlerts: [],
  unreadCount: 0,

  addAlert: (alert) =>
    set((state) => ({
      activeAlerts: [alert, ...state.activeAlerts].slice(0, 100),
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: (alertId) =>
    set((state) => ({
      activeAlerts: state.activeAlerts.map((a) =>
        a.id === alertId ? { ...a, isRead: true } : a
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      activeAlerts: state.activeAlerts.map((a) => ({ ...a, isRead: true })),
      unreadCount: 0,
    })),

  clearAlerts: () =>
    set({ activeAlerts: [], unreadCount: 0 }),
}))

export const selectUnreadCount = (state: AlertState) => state.unreadCount
export const selectActiveAlerts = (state: AlertState) => state.activeAlerts