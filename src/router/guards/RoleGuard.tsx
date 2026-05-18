import { Navigate, Outlet } from 'react-router-dom'
import { Result, Spin } from 'antd'
import { useAuthStore } from '@/stores/auth.store'
import type { Role } from '@/types/auth.types'
import { ROUTES } from '@/router/routes'

interface RoleGuardProps {
  allowedRoles: Role[]
}

const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  
  const user        = useAuthStore((s) => s.user)
  const hasHydrated = useAuthStore((s) => s._hasHydrated)

  // Tunggu hydration — sama seperti AuthGuard
  if (!hasHydrated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Result
        status="403"
        title="Akses Ditolak"
        subTitle="Maaf, kamu tidak memiliki akses ke halaman ini."
      />
    )
  }

  // DEBUG — hapus setelah selesai
  // console.log('[RoleGuard]', {
  //   hasHydrated,
  //   user,
  //   role: user?.role,
  //   allowedRoles,
  // })

  return <Outlet />
}

export default RoleGuard
