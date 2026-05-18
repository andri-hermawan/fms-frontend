import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import { 
  Map as MapIcon, 
  // ChevronDown, 
  // ChevronRight, 
  Truck, 
  AlertTriangle,
  MapPin,
  Sliders,
  Building,
  Landmark,
  RadioReceiver,
  Clock,
  OctagonAlert,
  SquareUser,
  Fuel,
  File,
  Road
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

const MENU_CONFIG: MenuConfig[] = [
  // {
  //   key: 'dashboard',
  //   icon: <DashboardOutlined />,
  //   label: 'Dashboard',
  //   path: ROUTES.DASHBOARD,
  // },
  {
    key: 'tracking',
    icon: <MapIcon />,
    label: 'Live Tracking',
    path: ROUTES.TRACKING,
  },
  {
    key: 'alert',
    icon: <AlertTriangle />,
    label: 'Alert',
    path: ROUTES.ALERT,
  },
  {
    key: 'geofence',
    icon: <MapPin />,
    label: 'Geofence',
    path: ROUTES.GEOFENCE,
  },
  {
    key: 'fuel',
    icon: <Fuel />,
    label: 'Fuel',
    path: ROUTES.FUEL,
  },
  {
    key: 'user',
    icon: <SquareUser />,
    label: 'User',
    path: ROUTES.USER,
    roles: ['superadmin'],
  },
  {
    key: 'report',
    icon: <File />,
    label: 'Report',
    path: ROUTES.REPORT,
  },
  {
    key: 'master',
    icon: <Sliders />,
    label: 'System Data',
    roles: ['superadmin', 'admin'],
    children: [
      {
        key: 'company',
        icon: <Building />,
        label: 'Company',
        path: ROUTES.COMPANY,
      },
      {
        key: 'project',
        icon: <Landmark />,
        label: 'Project',
        path: ROUTES.PROJECT,
      },
      {
        key: 'equipment',
        icon: <Truck />,
        label: 'Equipment',
        path: ROUTES.EQUIPMENT,
      },
      {
        key: 'device',
        icon: <RadioReceiver />,
        label: 'Device',
        path: ROUTES.DEVICE,
      },
      {
        key: 'shift',
        icon: <Clock />,
        label: 'Shift',
        path: ROUTES.SHIFT,
      },
      {
        key: 'alert-category',
        icon: <OctagonAlert />,
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
      width={220}
      style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
    >
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? 0 : '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* <img src="/logo.svg" alt="FMS" height={28} /> */}
        <Road style={{ color: '#0d6efd', marginLeft: 8 }} />
        {!collapsed && (
          <span style={{ color: '#fff', marginLeft: 10, fontWeight: 600, fontSize: 14 }}>
            FMS
          </span>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKeys}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0, marginTop: 8 }}
      />
    </Sider>
  )
}

export default Sidebar
