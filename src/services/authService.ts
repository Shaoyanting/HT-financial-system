import { mockUsers } from './mockData'

// 用户类型定义
export interface User {
  id: number
  username: string
  password: string
  name: string
  email: string
  avatar: string
  role: string
}

// 登录响应类型
export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: Omit<User, 'password'>
}

// 模拟登录函数
export const login = async (username: string, password: string): Promise<AuthResponse> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const user = mockUsers.find(u => u.username === username && u.password === password)
  
  if (user) {
    // 生成模拟token（实际项目中应使用JWT等安全方案）
    const token = `mock-jwt-token-${user.id}-${Date.now()}`
    
    // 存储token到localStorage（仅用于演示）
    localStorage.setItem('financial_system_token', token)
    localStorage.setItem('financial_system_user', JSON.stringify({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    }))
    
    return {
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    }
  }
  
  return {
    success: false,
    message: '用户名或密码错误',
  }
}

// 登出函数
export const logout = (): void => {
  localStorage.removeItem('financial_system_token')
  localStorage.removeItem('financial_system_user')
}

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('financial_system_token')
  return !!token
}

// 获取当前用户信息
export const getCurrentUser = (): Omit<User, 'password'> | null => {
  const userStr = localStorage.getItem('financial_system_user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error('解析用户信息失败:', error)
      return null
    }
  }
  return null
}

// 验证token（模拟）
export const validateToken = async (): Promise<boolean> => {
  const token = localStorage.getItem('financial_system_token')
  if (!token) return false
  
  // 模拟token验证
  await new Promise(resolve => setTimeout(resolve, 100))
  return token.startsWith('mock-jwt-token-')
}

export default {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  validateToken,
}
