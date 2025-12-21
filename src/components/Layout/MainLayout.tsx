import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  Space,
  theme,
  Badge,
  Tooltip,
} from 'antd'
import {
  DashboardOutlined,
  TableOutlined,
  LineChartOutlined,
  SafetyOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Wallet,
  Shield
} from 'lucide-react'
import { getCurrentUser, logout } from '../../services/authService'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = Layout
const { Title } = Typography

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const user = getCurrentUser()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据看板',
    },
    {
      key: '/data-grid',
      icon: <TableOutlined />,
      label: '数据列表',
    },
    {
      key: '/charts-analysis',
      icon: <LineChartOutlined />,
      label: '数据分析',
      children: [
        {
          key: '/trend-analysis',
          icon: <TrendingUp size={16} />,
          label: '趋势分析',
        },
        {
          key: '/asset-distribution',
          icon: <PieChart size={16} />,
          label: '资产分布',
        },
        {
          key: '/industry-analysis',
          icon: <BarChart3 size={16} />,
          label: '行业分析',
        },
      ],
    },
    {
      key: '/risk-management',
      icon: <SafetyOutlined />,
      label: '风险管理',
    },
    {
      key: '/portfolio',
      icon: <Wallet size={18} />,
      label: '投资组合',
    },
    {
      key: '/compliance',
      icon: <Shield size={18} />,
      label: '合规监控',
    },
  ]

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ]

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key)
  }

  const selectedKeys = [location.pathname]
  const openKeys = collapsed ? [] : ['/charts-analysis']

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          background: colorBgContainer,
          borderRight: '1px solid #f0f0f0',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{
          padding: collapsed ? '16px 8px' : '24px 16px',
          borderBottom: '1px solid #f0f0f0',
          textAlign: collapsed ? 'center' : 'left',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 12,
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BarChart3 size={24} color="white" />
            </div>
            {!collapsed && (
              <Title level={4} style={{ margin: 0 }}>
                恒天金融资产系统
              </Title>
            )}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            borderRight: 0,
            marginTop: 16,
            fontSize: 14,
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {(() => {
                  const menuItem = menuItems.find(item => item && 'key' in item && item.key === location.pathname)
                  return (menuItem && 'label' in menuItem ? menuItem.label : '恒天金融资产分析系统') as string
                })()}
              </Title>
            </div>
          </div>

          <Space size="large">
            <Tooltip title="通知">
              <Badge count={5} size="small">
                <Button type="text" icon={<BellOutlined />} />
              </Badge>
            </Tooltip>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer', padding: '0px 12px', borderRadius: 8, }}>
                <Avatar
                  src={user?.avatar}
                  icon={!user?.avatar && <UserOutlined />}
                  size="default"
                />
                {!collapsed && (
                  <div>
                    <div style={{ fontSize: 12, color: '#999' }}>{user?.role === 'admin' ? '管理员' : '普通用户'}</div>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          margin: '24px 16px',
          padding: 24,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          minHeight: 280,
          overflow: 'auto',
        }}>
          <Outlet />
        </Content>

        <div style={{
          padding: '16px 24px',
          textAlign: 'center',
          borderTop: '1px solid #f0f0f0',
          background: colorBgContainer,
          fontSize: 12,
          color: '#999',
        }}>
          <Space direction="vertical" size="small">
            <div>
              恒天金融资产数据分析及展示系统 © {new Date().getFullYear()} 版权所有
            </div>
            <div>
              版本 1.0.0 | 数据更新于 {new Date().toLocaleDateString()}
            </div>
          </Space>
        </div>
      </Layout>
    </Layout>
  )
}

export default MainLayout
