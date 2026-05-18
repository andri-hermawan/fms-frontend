import { Breadcrumb as AntBreadcrumb } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'
import { ROUTES } from '@/router/routes'

const ROUTE_LABEL: Record<string, string> = {
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
  master:                  'System Data',
}

const AppBreadcrumb = () => {
  const location  = useLocation()
  const pathnames = location.pathname.split('/').filter(Boolean)

  const items = [
    {
      title: (
        <Link to={ROUTES.DASHBOARD}>
          <HomeOutlined />
        </Link>
      ),
    },
    ...pathnames.map((segment, index) => {
      const path    = '/' + pathnames.slice(0, index + 1).join('/')
      const isLast  = index === pathnames.length - 1
      const label   = ROUTE_LABEL[path] ?? ROUTE_LABEL[segment] ?? segment

      return {
        title: isLast ? label : <Link to={path}>{label}</Link>,
      }
    }),
  ]

  return (
    <AntBreadcrumb
      items={items}
      style={{ marginBottom: 16, fontSize: 13 }}
    />
  )
}

export default AppBreadcrumb
