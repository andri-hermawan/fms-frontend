import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import AuthGuard from './guards/AuthGuard'
import RoleGuard from './guards/RoleGuard'
import { ROUTES } from './routes'
import LoadingScreen from '@/components/feedback/LoadingScreen'

// Lazy load semua halaman
const LoginPage         = lazy(() => import('@/pages/auth/LoginPage'))
const DashboardPage     = lazy(() => import('@/pages/dashboard/DashboardPage'))
const TrackingPage      = lazy(() => import('@/pages/tracking/TrackingPage'))
const AlertPage         = lazy(() => import('@/pages/alert/AlertPage'))
const FuelPage          = lazy(() => import('@/pages/fuel/FuelPage'))
const GeofencePage      = lazy(() => import('@/pages/geofence/GeofencePage'))
const ReportPage        = lazy(() => import('@/pages/report/ReportPage'))

const UserListPage      = lazy(() => import('@/pages/master/user/UserListPage'))
const CompanyListPage      = lazy(() => import('@/pages/master/company/CompanyListPage.tsx'))
const ProjectListPage      = lazy(() => import('@/pages/master/project/ProjectListPage'))
const EquipmentListPage   = lazy(() => import('@/pages/master/equipment/EquipmentListPage'))
const DeviceListPage    = lazy(() => import('@/pages/master/device/DeviceListPage'))
const ShiftListPage    = lazy(() => import('@/pages/master/shift/ShiftListPage'))
const AlertCategoryListPage    = lazy(() => import('@/pages/master/alert-category/AlertCategoryListPage'))


const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
)

const router = createBrowserRouter([
  // ─── Public routes ───────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: withSuspense(LoginPage),
      },
    ],
  },

  // ─── Protected routes ────────────────────────────────────────
  {
    element: <AuthGuard />,
    children: [
      {
        element: <MainLayout />,
        children: [
          // Dashboard
          // {
          //   path: ROUTES.DASHBOARD,
          //   element: withSuspense(DashboardPage),
          // },

          // Master data — admin & superadmin
          {
            element: <RoleGuard allowedRoles={['superadmin', 'admin']} />,
            children: [
              { path: ROUTES.USER,  element: withSuspense(UserListPage) },
              { path: ROUTES.COMPANY,  element: withSuspense(CompanyListPage) },
              { path: ROUTES.PROJECT,  element: withSuspense(ProjectListPage) },
              { path: ROUTES.EQUIPMENT,  element: withSuspense(EquipmentListPage) },
              { path: ROUTES.DEVICE,   element: withSuspense(DeviceListPage) },
              { path: ROUTES.SHIFT,    element: withSuspense(ShiftListPage) },
              { path: ROUTES.ALERT_CATEGORY, element: withSuspense(AlertCategoryListPage) },
            ],
          },

          // User management — superadmin only
          {
            element: <RoleGuard allowedRoles={['superadmin']} />,
            children: [
              { path: ROUTES.USER, element: withSuspense(UserListPage) },
            ],
          },

          // Operations — semua role
          { path: ROUTES.TRACKING,  element: withSuspense(TrackingPage) },
          { path: ROUTES.ALERT,     element: withSuspense(AlertPage) },
          { path: ROUTES.FUEL,      element: withSuspense(FuelPage) },
          { path: ROUTES.GEOFENCE,  element: withSuspense(GeofencePage) },
          { path: ROUTES.REPORT,    element: withSuspense(ReportPage) },
        ],
      },
    ],
  },

  // ─── Fallback ─────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to={ROUTES.TRACKING} replace />,
  },
],
  {
    basename: '/fms',
  }
)

export default router
