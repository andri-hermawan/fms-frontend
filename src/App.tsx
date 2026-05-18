import { RouterProvider } from 'react-router-dom'
import { App as AntApp, Spin } from 'antd'
import router from '@/router'
import ErrorBoundary from '@/components/feedback/ErrorBoundary'
import useRestoreSession from '@/hooks/useRestoreSession'
import { useAuthStore } from '@/stores/auth.store'
import { useEffect } from 'react'

// const SessionRestorer = () => {
//   useRestoreSession()
//   return null
// }

const FullScreenLoader = ({ text }: { text: string }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      zIndex: 9999,
      gap: 16,
    }}
  >
    <Spin size="large" />
    <span style={{ color: '#888', fontSize: 13 }}>
      {text}
    </span>
  </div>
)

const AppContent = () => {
  const hasHydrated       = useAuthStore((s) => s._hasHydrated)
  const isSessionRestored = useAuthStore((s) => s._isSessionRestored)
  const isAuthenticated   = useAuthStore((s) => s.isAuthenticated)
  const accessToken       = useAuthStore((s) => s.accessToken)
  const refreshToken      = useAuthStore((s) => s.refreshToken)

  useEffect(() => {
    // console.log('[APP] State:', {
    //   hasHydrated,
    //   isSessionRestored,
    //   isAuthenticated,
    //   hasAccessToken: !!accessToken,
    //   hasRefreshToken: !!refreshToken,
    // })
  }, [
    hasHydrated,
    isSessionRestored,
    isAuthenticated,
    accessToken,
    refreshToken,
  ])

  // Jalankan restore session
  useRestoreSession()

  // BELUM hydrate
  if (!hasHydrated) {
    return <FullScreenLoader text="Memuat aplikasi..." />
  }

  // Sudah login tapi restore belum selesai
  if (isAuthenticated && !isSessionRestored) {
    return <FullScreenLoader text="Memulihkan sesi..." />
  }

  // Baru render router setelah aman
  return <RouterProvider router={router} />
}

const App = () => (
  <ErrorBoundary>
    <AntApp>
      <AppContent />
    </AntApp>
  </ErrorBoundary>
)

export default App