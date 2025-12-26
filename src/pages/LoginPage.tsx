import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, AlertCircle } from 'lucide-react'
import { Button, Card, Form, Input, message, Typography, Space, Alert } from 'antd'
import { login } from '../services/authService'
import type { AuthResponse } from '../services/authService'

const { Title, Text } = Typography

const LoginPage: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true)
    setError('')
    
    try {
      const response: AuthResponse = await login(values.username, values.password)
      
      if (response.success) {
        message.success('登录成功！')
        // 跳转到主页面
        navigate('/dashboard')
      } else {
        setError(response.message)
        message.error(response.message)
      }
    } catch (err) {
      setError('登录过程中发生错误，请稍后重试')
      message.error('登录过程中发生错误，请稍后重试')
      console.error('登录错误:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Lock size={28} color="white" />
          </div>
          <Title level={2} style={{ marginBottom: 8 }}>
            网新恒天金融资产数据分析及展示平台
          </Title>
          <Text type="secondary">
            请输入您的凭证以访问系统
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            icon={<AlertCircle />}
            style={{ marginBottom: 24 }}
            closable
            onClose={() => setError('')}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            username: 'admin',
            password: 'admin123',
          }}
        >
          <Form.Item
            name="username"
            label="用户名/邮箱"
            rules={[
              { required: true, message: '请输入用户名或邮箱' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input
              prefix={<User size={18} />}
              placeholder="请输入用户名或邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<Lock size={18} />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{ height: 48, fontSize: 16 }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Space direction="vertical" size="small">
              <Space>
                <Button size="small">用户注册</Button>
                <Button size="small">忘记密码</Button>
              </Space>
            </Space>
          </div>
        </Form>

        <div style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center',
        }}>

        </div>
      </Card>
    </div>
  )
}

export default LoginPage
