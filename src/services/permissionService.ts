// 权限管理服务
import { mockUsers } from './mockData'

// 页面权限类型定义
export interface PagePermission {
  id: string
  name: string
  path: string
  description: string
}

// 用户权限类型定义
export interface UserPermission {
  userId: number
  username: string
  name: string
  role: string
  allowedPages: string[] // 允许访问的页面路径数组
}

// 所有可管理的页面列表
export const ALL_PAGES: PagePermission[] = [
  { id: 'dashboard', name: '资产总览', path: '/dashboard', description: '查看资产总览和关键指标' },
  { id: 'data-grid', name: '持仓明细', path: '/data-grid', description: '查看和管理持仓明细数据' },
  { id: 'charts-analysis', name: '数据分析', path: '/charts-analysis', description: '查看数据分析图表' },
  { id: 'trend-analysis', name: '趋势分析', path: '/trend-analysis', description: '查看资产趋势分析' },
  { id: 'asset-distribution', name: '资产分布', path: '/asset-distribution', description: '查看资产分布情况' },
  { id: 'risk-management', name: '风险管理', path: '/risk-management', description: '查看和管理风险指标' },
  { id: 'profile', name: '个人资料', path: '/profile', description: '查看和编辑个人资料' },
]

// 从localStorage获取用户权限
export const getUserPermissions = (): UserPermission[] => {
  try {
    const permissionsStr = localStorage.getItem('financial_system_user_permissions')
    if (permissionsStr) {
      return JSON.parse(permissionsStr)
    }
  } catch (error) {
    console.error('获取用户权限失败:', error)
  }
  
  // 如果没有存储的权限，初始化默认权限
  return initializeDefaultPermissions()
}

// 初始化默认权限
const initializeDefaultPermissions = (): UserPermission[] => {
  const defaultPermissions: UserPermission[] = mockUsers.map(user => ({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    allowedPages: user.role === 'admin' 
      ? ALL_PAGES.map(page => page.path) // 管理员默认拥有所有页面权限
      : [
          '/dashboard',
          '/data-grid',
          '/charts-analysis',
          '/trend-analysis',
          '/asset-distribution',
          '/profile'
        ] // 普通用户默认权限（不包括风险管理）
  }))
  
  // 保存到localStorage
  saveUserPermissions(defaultPermissions)
  return defaultPermissions
}

// 保存用户权限到localStorage
export const saveUserPermissions = (permissions: UserPermission[]): void => {
  try {
    localStorage.setItem('financial_system_user_permissions', JSON.stringify(permissions))
  } catch (error) {
    console.error('保存用户权限失败:', error)
  }
}

// 更新单个用户的权限
export const updateUserPermission = (userId: number, allowedPages: string[]): void => {
  const permissions = getUserPermissions()
  const userIndex = permissions.findIndex(p => p.userId === userId)
  
  if (userIndex !== -1) {
    permissions[userIndex] = {
      ...permissions[userIndex],
      allowedPages
    }
    saveUserPermissions(permissions)
  }
}

// 获取单个用户的权限
export const getUserPermission = (userId: number): UserPermission | undefined => {
  const permissions = getUserPermissions()
  return permissions.find(p => p.userId === userId)
}

// 检查用户是否有页面访问权限
export const hasPagePermission = (userId: number, pagePath: string): boolean => {
  const userPermission = getUserPermission(userId)
  if (!userPermission) return false
  
  // 管理员默认拥有所有权限
  if (userPermission.role === 'admin') return true
  
  return userPermission.allowedPages.includes(pagePath)
}

// 获取所有普通用户（用于权限管理）
export const getRegularUsers = (): UserPermission[] => {
  const permissions = getUserPermissions()
  return permissions.filter(user => user.role === 'user')
}

// 重置所有权限为默认值
export const resetPermissions = (): void => {
  localStorage.removeItem('financial_system_user_permissions')
  initializeDefaultPermissions()
}
