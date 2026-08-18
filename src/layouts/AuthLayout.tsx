import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTES } from '@/router/routes'
import styles from './AuthLayout.module.css'

const AuthLayout = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Kalau sudah login, redirect ke dashboard
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/logo.svg" alt="CH" height={40} />
          <h1 className={styles.appName}>CH</h1>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
