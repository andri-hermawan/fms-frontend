import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import { 
  Map as MapIcon, 
  RouteOff, 
  Truck, 
  AlertTriangle,
  SearchAlert,
  MapPin,
  Sliders,
  Building,
  Landmark,
  RadioReceiver,
  Clock,
  OctagonAlert,
  SquareUser,
  Fuel,
  // File,
  Road,
  Snail,
  Zap,
  ChartNoAxesCombined,
  FileText,
  Locate,
  Upload,
  UserPlus,
  BarChart,
  Scale,
  CircleGauge
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store'
import { useAlertStore } from '@/stores/alert.store'
import { useUiStore } from '@/stores/ui.store'
import { ROUTES } from '@/router/routes'
import type { Role } from '@/types/auth.types'

const { Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

interface MenuConfig {
  key: string
  icon: React.ReactNode
  label: string
  path?: string
  roles?: Role[]
  children?: MenuConfig[]
}

const iconStyle = {
  width: 18,
  height: 18,
}

const MENU_CONFIG: MenuConfig[] = [
  // {
  //   key: 'dashboard',
  //   icon: <DashboardOutlined />,
  //   label: 'Dashboard',
  //   path: ROUTES.DASHBOARD,
  // },
  {
    key: 'tracking',
    icon: <MapIcon {...iconStyle} />,
    label: 'Live Tracking',
    path: ROUTES.TRACKING,
  },
  {
    key: 'geofence',
    icon: <MapPin {...iconStyle} />,
    label: 'Geofence',
    path: ROUTES.GEOFENCE,
  },
  {
    key: 'all alerts',
    icon: <AlertTriangle {...iconStyle} />,
    label: 'Alerts',
    children: [
      {
        key: 'alert',
        icon: <SearchAlert {...iconStyle} />,
        label: 'All Alerts',
        path: ROUTES.ALERT,
      },
      {
        key: 'fuel-alert',
        icon: <Fuel {...iconStyle} />,
        label: 'Fuel Alert',
        path: ROUTES.FUELALERT,
      },
      {
        key: 'underspeed',
        icon: <Snail {...iconStyle} />,
        label: 'Underspeed Alert',
        path: ROUTES.UNDERSPEED,
      },
      {
        key: 'overspeed',
        icon: <Zap {...iconStyle} />,
        label: 'Overspeed Alert',
        path: ROUTES.OVERSPEED,
      },
      {
        key: 'offtrack',
        icon: <RouteOff {...iconStyle} />,
        label: 'Offtrack Alert',
        path: ROUTES.OFFTRACK,
      },
    ],
  },
  {
    key: 'graphic',
    icon: <ChartNoAxesCombined {...iconStyle} />,
    label: 'Graphic',
    path: ROUTES.POSITION_HISTORY,
  },
  {
    key: 'distribution-map',
    icon: <Locate {...iconStyle} />,
    label: 'Distribution Map',
    path: ROUTES.DISTRIBUTION_MAP,
  },
  {
    key: 'speed-per-segment',
    icon: <CircleGauge {...iconStyle} />,
    label: 'Speed Per Segment',
    path: ROUTES.SPEED_PER_SEGMENT,
  },
  {
    key: 'fuel',
    icon: <Fuel {...iconStyle} />,
    label: 'Fuel',
    path: ROUTES.FUEL,
  },
  {
    key: 'report',
    icon: <FileText {...iconStyle} />,
    label: 'Report',
    path: ROUTES.REPORT,
  },
  // {
  //   key: 'user',
  //   icon: <SquareUser {...iconStyle} />,
  //   label: 'User',
  //   path: ROUTES.USER,
  //   roles: ['superadmin'],
  // },
  {
    key: 'upload',
    icon: <Upload {...iconStyle} />,
    label: 'Upload Data',
    roles: ['superadmin', 'admin'],
    children: [
      {
        key: 'daily-setting-operator',
        icon: <UserPlus {...iconStyle} />,
        label: 'Setting Operator',
        path: ROUTES.DAILY_SETTING_OPERATOR,
      },
      {
        key: 'status-breakdown',
        icon: <BarChart {...iconStyle} />,
        label: 'Status Breakdown',
        path: ROUTES.STATUS_BREAKDOWN,
      },
      {
        key: 'weighbridge',
        icon: <Scale {...iconStyle} />,
        label: 'Weighbridge',
        path: ROUTES.WEIGHBRIDGE,
      },
    ],
  },
  {
    key: 'master',
    icon: <Sliders {...iconStyle} />,
    label: 'System Data',
    roles: ['superadmin', 'admin'],
    children: [
      {
        key: 'user',
        icon: <SquareUser {...iconStyle} />,
        label: 'User',
        path: ROUTES.USER,
      },
      {
        key: 'company',
        icon: <Building {...iconStyle} />,
        label: 'Company',
        path: ROUTES.COMPANY,
      },
      {
        key: 'project',
        icon: <Landmark {...iconStyle} />,
        label: 'Project',
        path: ROUTES.PROJECT,
      },
      {
        key: 'equipment',
        icon: <Truck {...iconStyle} />,
        label: 'Equipment',
        path: ROUTES.EQUIPMENT,
      },
      {
        key: 'device',
        icon: <RadioReceiver {...iconStyle} />,
        label: 'Device',
        path: ROUTES.DEVICE,
      },
      {
        key: 'fuel-calibration',
        icon: <Fuel {...iconStyle} />,
        label: 'Fuel Calibration',
        path: ROUTES.FUEL_CALIBRATION,
      },
      {
        key: 'shift',
        icon: <Clock {...iconStyle} />,
        label: 'Shift',
        path: ROUTES.SHIFT,
      },
      {
        key: 'alert-category',
        icon: <OctagonAlert {...iconStyle} />,
        label: 'Alert Category',
        path: ROUTES.ALERT_CATEGORY,
      },
    ],
  },
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const userRole = useAuthStore((s) => s.user?.role)
  const unreadCount = useAlertStore((s) => s.unreadCount)

  // Filter menu berdasarkan role
  const filteredMenu = useMemo(() => {
    const filterItems = (items: MenuConfig[]): MenuConfig[] =>
      items
        .filter((item) => !item.roles || userRole && item.roles.includes(userRole))
        .map((item) => ({
          ...item,
          children: item.children ? filterItems(item.children) : undefined,
        }))
    return filterItems(MENU_CONFIG)
  }, [userRole])

  // Convert config ke format Ant Design Menu
  const menuItems: MenuItem[] = useMemo(() => {
    const buildItems = (items: MenuConfig[]): MenuItem[] =>
      items.map((item) => ({
        key: item.path ?? item.key,
        icon: item.icon,
        label: item.key === 'alert' && unreadCount > 0
          ? `Alert (${unreadCount})`
          : item.label,
        children: item.children ? buildItems(item.children) : undefined,
      }))
    return buildItems(filteredMenu)
  }, [filteredMenu, unreadCount])

  // Tentukan menu mana yang aktif berdasarkan current path
  const selectedKey = location.pathname
  const openKeys = useMemo(() => {
    const open: string[] = []
    MENU_CONFIG.forEach((item) => {
      if (item.children?.some((c) => c.path === location.pathname)) {
        open.push(item.key)
      }
    })
    return open
  }, [location.pathname])

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      theme="light"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
        }}
      >
        <Road
          size={20}
          style={{
            color: '#1677ff',
          }}
        />

        {!collapsed && (
          <span
            style={{
              color: '#111',
              marginLeft: 10,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            CHRS
          </span>
        )}
      </div>

      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKeys}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          marginTop: 10,
          paddingInline: 10,
          fontSize: 13,
          background: '#fff',
        }}
      />
    </Sider>
  )
}

export default Sidebar
