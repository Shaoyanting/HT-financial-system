import { post } from '../utils/fetchWrapper'

// 用户类型定义
export interface User {
  id: number
  username: string
  password: string
  name: string
  email: string
  avatar: string
  role: string
  phone?: string
  department?: string
  position?: string
  joinDate?: string
  lastLogin?: string
  bio?: string
}

// 登录请求类型
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应类型
export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: {
    id: number
    username: string
    name: string
    role: string
  }
}

// 真实登录函数 - 调用后端API
export const login = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await post<AuthResponse>('/auth/login', {
      username,
      password,
    }, {
      showLoading: true,
      showError: true,
      timeout: 30000,
    })

    const authData = response.data

    if (authData.success && authData.token && authData.user) {
      // 存储token到localStorage
      localStorage.setItem('auth_token', authData.token)
      localStorage.setItem('user_info', JSON.stringify(authData.user))
      
      // 为了向后兼容，也存储旧的key
      localStorage.setItem('financial_system_token', authData.token)
      localStorage.setItem('financial_system_user', JSON.stringify(authData.user))
    }

    return authData
  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '网络错误，请检查网络连接',
    }
  }
}

// 登出函数 - 清除所有登录信息
export const logout = (): void => {
  // 清除新的token存储
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_info')
  
  // 清除旧的token存储（为了向后兼容）
  localStorage.removeItem('financial_system_token')
  localStorage.removeItem('financial_system_user')
  
  // 清除所有用户扩展信息
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('financial_system_user_profile_')) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key))
  
  console.log('用户已登出，所有登录信息已清除')
}

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  // 优先检查新的token存储
  const token = localStorage.getItem('auth_token') || localStorage.getItem('financial_system_token')
  return !!token
}

// 获取当前用户信息
export const getCurrentUser = (): Omit<User, 'password'> | null => {
  // 优先检查新的用户信息存储
  let userStr = localStorage.getItem('user_info')
  if (!userStr) {
    // 回退到旧的用户信息存储
    userStr = localStorage.getItem('financial_system_user')
  }
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      // 从localStorage加载用户扩展信息
      const userProfileStr = localStorage.getItem(`financial_system_user_profile_${user.id}`)
      if (userProfileStr) {
        const userProfile = JSON.parse(userProfileStr)
        return { ...user, ...userProfile }
      }
      return user
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

// 保存用户个人信息
export const saveUserProfile = (userId: number, profileData: Partial<Omit<User, 'id' | 'username' | 'password' | 'role'>>): void => {
  try {
    // 获取当前用户信息
    const currentUser = getCurrentUser()
    if (!currentUser) return
    
    // 合并用户信息
    const updatedUser = { ...currentUser, ...profileData }
    
    // 保存到localStorage
    localStorage.setItem(`financial_system_user_profile_${userId}`, JSON.stringify(profileData))
    
    // 同时更新主用户信息
    localStorage.setItem('financial_system_user', JSON.stringify(updatedUser))
    
    console.log('用户信息已保存:', profileData)
  } catch (error) {
    console.error('保存用户信息失败:', error)
  }
}

// 获取用户扩展信息
export const getUserProfile = (userId: number): Partial<Omit<User, 'id' | 'username' | 'password' | 'role'>> | null => {
  try {
    const profileStr = localStorage.getItem(`financial_system_user_profile_${userId}`)
    if (profileStr) {
      return JSON.parse(profileStr)
    }
    return null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

export default {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  validateToken,
  saveUserProfile,
  getUserProfile,
}
