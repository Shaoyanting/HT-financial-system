import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Avatar, 
  Space, 
  Row, 
  Col, 
  Tag, 
  message, 
  Divider,
  Descriptions,
  Select,
  DatePicker
} from 'antd'
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  IdcardOutlined,
  CalendarOutlined,
  SaveOutlined,
  EditOutlined,
  LockOutlined
} from '@ant-design/icons'
import { getCurrentUser, saveUserProfile, type User } from '../services/authService'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm()
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  // 加载用户信息
  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    
    if (currentUser) {
      form.setFieldsValue({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        department: currentUser.department || '',
        position: currentUser.position || '',
        joinDate: currentUser.joinDate ? dayjs(currentUser.joinDate) : null,
        avatar: currentUser.avatar,
        bio: currentUser.bio || '',
      })
    }
  }, [form])

  // 处理保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      if (user) {
        // 格式化日期
        const formattedValues = {
          ...values,
          joinDate: values.joinDate ? values.joinDate.format('YYYY-MM-DD') : undefined,
        }
        
        // 保存到localStorage
        saveUserProfile(user.id, formattedValues)
        
        // 更新本地状态
        setUser({ ...user, ...formattedValues })
        setEditing(false)
        
        message.success('个人信息保存成功')
      }
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请检查表单')
    } finally {
      setLoading(false)
    }
  }

  // 处理编辑
  const handleEdit = () => {
    setEditing(true)
  }

  // 处理取消
  const handleCancel = () => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
        joinDate: user.joinDate ? dayjs(user.joinDate) : null,
        avatar: user.avatar,
        bio: user.bio || '',
      })
    }
    setEditing(false)
  }

  // 如果没有用户信息，显示加载状态
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Title level={3}>加载中...</Title>
      </div>
    )
  }

  // 角色标签颜色
  const roleColor = user.role === 'admin' ? 'red' : 'blue'
  const roleText = user.role === 'admin' ? '管理员' : '普通用户'

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>个人信息</Title>
        <Text type="secondary">查看和管理您的个人资料信息</Text>
      </div>

      <Row gutter={[24, 24]} style={{ display: 'flex', alignItems: 'stretch' }}>
        {/* 左侧：基本信息卡片 */}
        <Col xs={24} lg={8}>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={120} 
                src={user.avatar} 
                icon={!user.avatar && <UserOutlined />}
                style={{ marginBottom: 16 }}
              />
              <Title level={3} style={{ marginBottom: 8 }}>{user.name}</Title>
              <Tag color={roleColor} style={{ fontSize: 14, padding: '4px 12px' }}>
                {roleText}
              </Tag>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">@{user.username}</Text>
              </div>
            </div>

            <Divider />

            {/* 账户信息 */}
            <div style={{ marginBottom: 24, flex: 1 }}>
              <Title level={4}>账户信息</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="用户ID">
                  <Text strong>{user.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="用户名">
                  <Text strong>{user.username}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="权限">
                  <Text>{user.role === 'admin' ? '管理员' : '普通用户'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="邮箱">
                  <Space>
                    <MailOutlined />
                    <Text>{user.email}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="部门">
                  <Space>
                    <IdcardOutlined />
                    <Text>{user.department || '未设置'}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="职位">
                  <Space>
                    <IdcardOutlined />
                    <Text>{user.position || '未设置'}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="入职日期">
                  <Space>
                    <CalendarOutlined />
                    <Text>{user.joinDate || '未设置'}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="最后登录">
                  <Space>
                    <CalendarOutlined />
                    <Text>{user.lastLogin || '未知'}</Text>
                  </Space>
                </Descriptions.Item>
              </Descriptions>

              {/* 个人简介 */}
              {user.bio && (
                <div style={{ marginTop: 24 }}>
                  <Title level={5}>个人简介</Title>
                  <div style={{
                    padding: 12,
                    background: '#fafafa',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}>
                    <Text>{user.bio}</Text>
                  </div>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div style={{ textAlign: 'center', marginTop: 'auto' }}>
              {editing ? (
                <Space>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    onClick={handleSave}
                    loading={loading}
                  >
                    保存修改
                  </Button>
                  <Button onClick={handleCancel}>
                    取消
                  </Button>
                </Space>
              ) : (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={handleEdit}
                >
                  编辑个人信息
                </Button>
              )}
            </div>
          </Card>

        </Col>

        {/* 右侧：详细信息表单 */}
        <Col xs={24} lg={16}>
          <Card title="详细信息" extra={
            <Tag color={roleColor}>
              {roleText}
            </Tag>
          }>
            <Form
              form={form}
              layout="vertical"
              disabled={!editing}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="姓名"
                    name="name"
                    rules={[{ required: true, message: '请输入姓名' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="请输入您的姓名"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      placeholder="请输入您的邮箱"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="手机号"
                    name="phone"
                    rules={[
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                    ]}
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      placeholder="请输入您的手机号"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="部门"
                    name="department"
                  >
                    <Select placeholder="请选择部门">
                      <Option value="投资部">投资部</Option>
                      <Option value="风控部">风控部</Option>
                      <Option value="研究部">研究部</Option>
                      <Option value="技术部">技术部</Option>
                      <Option value="市场部">市场部</Option>
                      <Option value="财务部">财务部</Option>
                      <Option value="人力资源部">人力资源部</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="职位"
                    name="position"
                  >
                    <Input 
                      prefix={<IdcardOutlined />} 
                      placeholder="请输入您的职位"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="入职日期"
                    name="joinDate"
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      placeholder="请选择入职日期"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label="头像URL"
                    name="avatar"
                    rules={[
                      { type: 'url', message: '请输入有效的URL地址' }
                    ]}
                  >
                    <Input 
                      placeholder="请输入头像图片URL"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label="个人简介"
                    name="bio"
                  >
                    <TextArea 
                      rows={4}
                      placeholder="请输入个人简介..."
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                </Col>
              </Row>

              {editing && (
                <div style={{ textAlign: 'right', marginTop: 24 }}>
                  <Space>
                    <Button onClick={handleCancel}>
                      取消
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />} 
                      onClick={handleSave}
                      loading={loading}
                    >
                      保存修改
                    </Button>
                  </Space>
                </div>
              )}
            </Form>
          </Card>

          {/* 系统信息卡片 */}
          <Card title="系统信息" style={{ marginTop: 24 }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
                  <Text type="secondary">账户创建时间</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text strong>{dayjs().subtract(1, 'year').format('YYYY-MM-DD')}</Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
                  <Text type="secondary">账户状态</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="success">正常</Tag>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
                  <Text type="secondary">数据更新时间</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text strong>{dayjs().format('YYYY-MM-DD HH:mm:ss')}</Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
                  <Text type="secondary">安全等级</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="warning">中等</Tag>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Button icon={<LockOutlined />}>
                修改密码
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProfilePage
