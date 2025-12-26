import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Typography, 
  Space, 
  Tag, 
  message, 
  Checkbox, 
  Row, 
  Col,
  Popconfirm,
  Tooltip,
  Input,
  Avatar,
  Badge
} from 'antd'
import { 
  UserOutlined, 
  SaveOutlined, 
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons'
import { 
  getRegularUsers, 
  updateUserPermission, 
  ALL_PAGES, 
  type UserPermission,
  resetPermissions
} from '../services/permissionService'
import { getCurrentUser } from '../services/authService'

const { Title, Text } = Typography
const { Search } = Input

const PermissionManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchText, setSearchText] = useState('')
  const currentUser = getCurrentUser()

  // 加载用户权限数据
  const loadUsers = () => {
    setLoading(true)
    try {
      const regularUsers = getRegularUsers()
      setUsers(regularUsers)
    } catch (error) {
      console.error('加载用户权限失败:', error)
      message.error('加载用户权限失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // 处理权限变更
  const handlePermissionChange = (userId: number, pagePath: string, checked: boolean) => {
    const updatedUsers = users.map(user => {
      if (user.userId === userId) {
        const allowedPages = checked 
          ? [...user.allowedPages, pagePath]
          : user.allowedPages.filter(path => path !== pagePath)
        
        return { ...user, allowedPages }
      }
      return user
    })
    
    setUsers(updatedUsers)
  }

  // 保存权限
  const handleSave = () => {
    setSaving(true)
    try {
      users.forEach(user => {
        updateUserPermission(user.userId, user.allowedPages)
      })
      message.success('权限保存成功')
    } catch (error) {
      console.error('保存权限失败:', error)
      message.error('保存权限失败')
    } finally {
      setSaving(false)
    }
  }

  // 重置权限
  const handleReset = () => {
    resetPermissions()
    loadUsers()
    message.success('权限已重置为默认值')
  }

  // 过滤用户
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.username.toLowerCase().includes(searchText.toLowerCase())
  )

  // 检查用户是否拥有某个页面权限
  const hasPermission = (user: UserPermission, pagePath: string) => {
    return user.allowedPages.includes(pagePath)
  }

  // 列定义
  const columns = [
    {
      title: '用户信息',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_: string, user: UserPermission) => (
        <Space>
          <Avatar 
            size="small" 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{user.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>@{user.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '权限数量',
      dataIndex: 'allowedPages',
      key: 'permissionCount',
      width: 120,
      render: (allowedPages: string[]) => (
        <Badge 
          count={allowedPages.length} 
          showZero 
          style={{ backgroundColor: allowedPages.length > 0 ? '#52c41a' : '#d9d9d9' }}
        />
      ),
    },
    ...ALL_PAGES.map(page => ({
      title: (
        <Tooltip title={page.description}>
          <span>{page.name}</span>
        </Tooltip>
      ),
      dataIndex: 'allowedPages',
      key: page.id,
      width: 120,
      align: 'center' as const,
      render: (allowedPages: string[], user: UserPermission) => (
        <Checkbox
          checked={hasPermission(user, page.path)}
          onChange={(e) => handlePermissionChange(user.userId, page.path, e.target.checked)}
          disabled={user.role === 'admin'}
        >
          {hasPermission(user, page.path) ? (
            <EyeOutlined style={{ color: '#52c41a' }} />
          ) : (
            <EyeInvisibleOutlined style={{ color: '#ff4d4f' }} />
          )}
        </Checkbox>
      ),
    })),
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: unknown, user: UserPermission) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              // 选中所有页面
              const updatedUsers = users.map(u => {
                if (u.userId === user.userId) {
                  return { ...u, allowedPages: ALL_PAGES.map(p => p.path) }
                }
                return u
              })
              setUsers(updatedUsers)
            }}
          >
            全选
          </Button>
          <Button 
            type="link" 
            size="small"
            danger
            onClick={() => {
              // 清空所有页面
              const updatedUsers = users.map(u => {
                if (u.userId === user.userId) {
                  return { ...u, allowedPages: [] }
                }
                return u
              })
              setUsers(updatedUsers)
            }}
          >
            清空
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>权限管理</Title>
        <Text type="secondary">管理普通用户的页面访问权限</Text>
      </div>

      {/* 当前用户信息 */}
      {currentUser && currentUser.role === 'admin' && (
        <Card style={{ marginBottom: 24 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space>
                <Avatar 
                  src={currentUser.avatar} 
                  icon={<UserOutlined />}
                />
                <div>
                  <div style={{ fontWeight: 'bold' }}>{currentUser.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    <Tag color="red">管理员</Tag> 拥有所有页面权限
                  </div>
                </div>
              </Space>
            </Col>
            <Col>
              <Text type="secondary">管理员可以管理所有用户的页面访问权限</Text>
            </Col>
          </Row>
        </Card>
      )}

      {/* 操作栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="搜索用户姓名或用户名"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadUsers}
                loading={loading}
              >
                刷新
              </Button>
              <Popconfirm
                title="确定要重置所有权限吗？"
                description="这将重置所有用户的权限为默认值，此操作不可撤销。"
                onConfirm={handleReset}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<ReloadOutlined />}>
                  重置权限
                </Button>
              </Popconfirm>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSave}
                loading={saving}
              >
                保存权限
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 权限说明 */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>页面权限说明</Title>
        <Row gutter={[16, 16]}>
          {ALL_PAGES.map(page => (
            <Col xs={24} sm={12} md={8} lg={6} key={page.id}>
              <div style={{ 
                padding: 12, 
                border: '1px solid #f0f0f0', 
                borderRadius: 8,
                height: '100%'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{page.name}</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{page.path}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{page.description}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 用户权限表格 */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={4}>用户权限管理</Title>
          <Text type="secondary">
            共 {filteredUsers.length} 个普通用户，勾选表示允许访问该页面
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="userId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个用户`,
          }}
          scroll={{ x: 1200 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <div style={{ fontWeight: 'bold' }}>批量操作</div>
                </Table.Summary.Cell>
                {ALL_PAGES.map((page, index) => (
                  <Table.Summary.Cell index={index + 1} key={page.id} align="center">
                    <Checkbox
                      indeterminate={filteredUsers.some(user => hasPermission(user, page.path)) && 
                                   !filteredUsers.every(user => hasPermission(user, page.path))}
                      checked={filteredUsers.length > 0 && filteredUsers.every(user => hasPermission(user, page.path))}
                      onChange={(e) => {
                        const checked = e.target.checked
                        const updatedUsers = users.map(user => {
                          if (user.role === 'user') {
                            const allowedPages = checked
                              ? [...new Set([...user.allowedPages, page.path])]
                              : user.allowedPages.filter(path => path !== page.path)
                            return { ...user, allowedPages }
                          }
                          return user
                        })
                        setUsers(updatedUsers)
                      }}
                    />
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell index={ALL_PAGES.length + 2}>
                  <Space>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => {
                        // 为所有用户选中所有页面
                        const updatedUsers = users.map(user => {
                          if (user.role === 'user') {
                            return { ...user, allowedPages: ALL_PAGES.map(p => p.path) }
                          }
                          return user
                        })
                        setUsers(updatedUsers)
                      }}
                    >
                      全选所有
                    </Button>
                    <Button 
                      type="link" 
                      size="small"
                      danger
                      onClick={() => {
                        // 为所有用户清空所有页面
                        const updatedUsers = users.map(user => {
                          if (user.role === 'user') {
                            return { ...user, allowedPages: [] }
                          }
                          return user
                        })
                        setUsers(updatedUsers)
                      }}
                    >
                      清空所有
                    </Button>
                  </Space>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  )
}

export default PermissionManagementPage
