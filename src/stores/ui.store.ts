import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  sidebarCollapsed: boolean
  pageTitle: string

  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setPageTitle: (title: string) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: true,
      pageTitle: 'Dashboard',

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      setPageTitle: (title) =>
        set({ pageTitle: title }),
    }),
    {
      name: 'fms-ui',
      partialize: () => ({}), // tidak menyimpan sidebarCollapsed
    }
  )
)