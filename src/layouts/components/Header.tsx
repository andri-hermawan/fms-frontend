import { Layout, Button, Avatar, Dropdown, Badge, Space, Typography } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { useAlertStore } from '@/stores/alert.store'
import { ROUTES } from '@/router/routes'

const { Header: AntHeader } = Layout
const { Text } = Typography

const Header = () => {
  const navigate = useNavigate()
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const pageTitle = useUiStore((s) => s.pageTitle)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const unreadCount = useAlertStore((s) => s.unreadCount)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Profil',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Keluar',
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
      }}
    >
      {/* Left: toggle + title */}
      <Space>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{ fontSize: 16 }}
        />
        <Text strong style={{ fontSize: 16 }}>
          {pageTitle}
        </Text>
      </Space>

      {/* Right: notif + user */}
      <Space size={16}>
        <Badge count={unreadCount} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 18 }} />}
            onClick={() => navigate(ROUTES.ALERT)}
          />
        </Badge>

        <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              size={32}
              icon={<UserOutlined />}
              style={{ background: '#1677ff' }}
            />
            <span style={{ fontSize: 13 }}>{user?.name}</span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

export default Header
