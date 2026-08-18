import { Layout, Button, Avatar, Dropdown, Space, Typography } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTES } from '@/router/routes'
import AlertDropdown from './AlertDropdown'

const { Header: AntHeader } = Layout
const { Text } = Typography

const Header = () => {
  const navigate = useNavigate()
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const pageTitle = useUiStore((s) => s.pageTitle)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

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
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 60,
        lineHeight: '60px',
        padding: '0 28px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e8e8e8',
        boxShadow: '0 1px 3px rgba(0,0,0,.06)',
      }}
    >
      {/* Left: toggle + title */}
      <Space size={16}>
        <Button
          type="text"
          icon={
            collapsed
              ? <MenuUnfoldOutlined />
              : <MenuFoldOutlined />
          }
          onClick={toggleSidebar}
          style={{
            fontSize: 18,
            width: 40,
            height: 40,
          }}
        />

        <Text
          strong
          style={{
            fontSize: 20,
            color: '#222',
            marginBottom: 0,
          }}
        >
          {pageTitle}
        </Text>
      </Space>

      {/* Right: notif + user */}
      <Space size={20}>
        <AlertDropdown />

        <Dropdown
          menu={{ items: userMenu }}
          placement="bottomRight"
          arrow
        >
          <Space
            style={{
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: 8,
            }}
          >
            <Avatar
              size={34}
              icon={<UserOutlined />}
              style={{ background: '#1677ff' }}
            />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1.2,
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {user?.name}
              </span>

              <span
                style={{
                  fontSize: 11,
                  color: '#888',
                }}
              >
                {user?.role}
              </span>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

export default Header
