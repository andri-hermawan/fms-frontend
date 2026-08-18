import { Layout } from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'

const { Content } = Layout

const ROUTE_TITLE: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.COMPANY]: 'Company',
  [ROUTES.PROJECT]: 'Project',
  [ROUTES.EQUIPMENT]: 'Equipment',
  [ROUTES.DEVICE]: 'GPS Device',
  [ROUTES.SHIFT]: 'Shift',
  [ROUTES.ALERT_CATEGORY]: 'Alert Category',
  [ROUTES.USER]: 'User',
  [ROUTES.TRACKING]: 'Live Tracking',
  [ROUTES.ALERT]: 'Alert',
  [ROUTES.FUELALERT]: 'Fuel',
  [ROUTES.UNDERSPEED]: 'Underspeed',
  [ROUTES.OVERSPEED]: 'Overspeed',
  [ROUTES.OFFTRACK]: 'Off Track',
  [ROUTES.FUEL]: 'Fuel',
  [ROUTES.GEOFENCE]: 'Geofence',
  [ROUTES.GRAPHIC]: 'Graphic',
  [ROUTES.DISTRIBUTION_MAP]: 'Distribution Map',
  [ROUTES.FUEL_CALIBRATION]: 'Fuel Calibration',
  [ROUTES.DAILY_SETTING_OPERATOR]: 'Daily Setting Operator',
  [ROUTES.STATUS_BREAKDOWN]: 'Status Breakdown',
  [ROUTES.WEIGHBRIDGE]: 'Weighbridge',
  [ROUTES.REPORT]: 'Report',
  [ROUTES.POSITION_HISTORY]: 'Position History',
}

const SIDEBAR_WIDTH = 260
const SIDEBAR_COLLAPSED_WIDTH = 80

const MainLayout = () => {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const setPageTitle = useUiStore((s) => s.setPageTitle)
  const location = useLocation()

  useEffect(() => {
    const title = ROUTE_TITLE[location.pathname] ?? 'FMS'
    setPageTitle(title)
    document.title = `${title} — FMS`
  }, [location.pathname, setPageTitle])

  const sidebarWidth = collapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_WIDTH

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar />

      <Layout
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left .2s ease',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Header />

        <Content
          style={{
            padding: 24,
            margin: 0,
            background: '#f5f7fa',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout