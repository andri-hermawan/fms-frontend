import { Layout } from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
// import AppBreadcrumb from './components/Breadcrumb'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'

const { Content } = Layout

const ROUTE_TITLE: Record<string, string> = {
  [ROUTES.DASHBOARD]:      'Dashboard',
  [ROUTES.COMPANY]:        'Company',
  [ROUTES.PROJECT]:        'Project',
  [ROUTES.EQUIPMENT]:      'Equipment',
  [ROUTES.DEVICE]:         'GPS Device',
  [ROUTES.SHIFT]:          'Shift',
  [ROUTES.ALERT_CATEGORY]: 'Alert Category',
  [ROUTES.USER]:           'User',
  [ROUTES.TRACKING]:       'Live Tracking',
  [ROUTES.ALERT]:          'Alert',
  [ROUTES.FUEL]:           'Fuel',
  [ROUTES.GEOFENCE]:       'Geofence',
  [ROUTES.REPORT]:         'Report',
}

const MainLayout = () => {
  const collapsed    = useUiStore((s) => s.sidebarCollapsed)
  const setPageTitle = useUiStore((s) => s.setPageTitle)
  const location     = useLocation()

  useEffect(() => {
    const title = ROUTE_TITLE[location.pathname] ?? 'FMS'
    setPageTitle(title)
    document.title = `${title} — FMS`
  }, [location.pathname, setPageTitle])

  const sidebarWidth = collapsed ? 80 : 220

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />

      <Layout
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header />

        <Content
          style={{
            margin: 24,
            minHeight: 'calc(100vh - 64px - 48px)',
          }}
        >
          {/* <AppBreadcrumb /> */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
