import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import AuthGuard from './guards/AuthGuard'
import RoleGuard from './guards/RoleGuard'
import { ROUTES } from './routes'
import LoadingScreen from '@/components/feedback/LoadingScreen'
import PositionHistoryPage from '@/pages/position-history/PositionHistoryPage'

// Lazy load semua halaman
const LoginPage         = lazy(() => import('@/pages/auth/LoginPage'))
const TrackingPage      = lazy(() => import('@/pages/tracking/TrackingPage'))
const AlertListPage         = lazy(() => import('@/pages/alert/AlertListPage'))
const FuelAlertPage          = lazy(() => import('@/pages/alert/fuel/FuelAlertPage'))
const UnderspeedAlertPage = lazy(() => import('@/pages/alert/underspeed/UnderspeedAlertPage'))
const OverspeedAlertPage = lazy(() => import('@/pages/alert/overspeed/OverspeedAlertPage'))
const OffTrackAlertPage = lazy(() => import('@/pages/alert/off-track/OffTrackAlertPage'))
const GeofencePage      = lazy(() => import('@/pages/geofence/GeofencePage'))
const GraphicPage       = lazy(() => import('@/pages/graphic/GraphicPage'))
const DistributionMapPage = lazy(() => import('@/pages/distribution-maps/DistributionMapPage'))
const ReportPage        = lazy(() => import('@/pages/report/ReportPage'))

const UserListPage      = lazy(() => import('@/pages/master/user/UserListPage'))
const CompanyListPage      = lazy(() => import('@/pages/master/company/CompanyListPage'))
const ProjectListPage      = lazy(() => import('@/pages/master/project/ProjectListPage'))
const EquipmentListPage   = lazy(() => import('@/pages/master/equipment/EquipmentListPage'))
const DeviceListPage    = lazy(() => import('@/pages/master/device/DeviceListPage'))
const ShiftListPage    = lazy(() => import('@/pages/master/shift/ShiftListPage'))
const AlertCategoryListPage    = lazy(() => import('@/pages/master/alert-category/AlertCategoryListPage'))
const DailySettingOperatorPage = lazy(() => import('@/pages/upload-data/daily-setting-operator/DailySettingOperatorPage'))
const StatusBreakdownPage = lazy(() => import('@/pages/upload-data/status-breakdown/StatusBreakdownPage'))
const WeighbridgePage = lazy(() => import('@/pages/upload-data/weighbridge/WeighbridgePage'))
const FuelCalibrationPage = lazy(() => import('@/pages/fuel-calibration/FuelCalibrationPage'))
const FuelPage = lazy(() => import('@/pages/fuel/FuelPage'))
const PositionHistoryPage = lazy(() => import('@/pages/position-history/PositionHistoryPage'))



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
              { path: ROUTES.DAILY_SETTING_OPERATOR, element: withSuspense(DailySettingOperatorPage) },
              { path: ROUTES.FUEL_CALIBRATION, element: withSuspense(FuelCalibrationPage) },
              { path: ROUTES.STATUS_BREAKDOWN, element: withSuspense(StatusBreakdownPage) },
              { path: ROUTES.WEIGHBRIDGE, element: withSuspense(WeighbridgePage) },

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
          { path: ROUTES.ALERT,     element: withSuspense(AlertListPage) },
          { path: ROUTES.FUELALERT,      element: withSuspense(FuelAlertPage) },
          { path: ROUTES.UNDERSPEED, element: withSuspense(UnderspeedAlertPage) },
          { path: ROUTES.OVERSPEED,  element: withSuspense(OverspeedAlertPage) },
          { path: ROUTES.OFFTRACK,   element: withSuspense(OffTrackAlertPage) },
          { path: ROUTES.GEOFENCE,  element: withSuspense(GeofencePage) },
          { path: ROUTES.GRAPHIC,   element: withSuspense(GraphicPage) },
          { path: ROUTES.DISTRIBUTION_MAP,   element: withSuspense(DistributionMapPage) },
          { path: ROUTES.REPORT,    element: withSuspense(ReportPage) },
          { path: ROUTES.FUEL, element: withSuspense(FuelPage) },
          { path: ROUTES.POSITION_HISTORY, element: withSuspense(PositionHistoryPage) },
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
