/**
 * 环境配置
 * 用于管理不同环境的API基础URL和其他配置
 * 支持通过环境变量动态配置
 */

// 环境类型定义
export type Environment = 'development' | 'production' | 'uat'

// 环境配置接口
export interface EnvironmentConfig {
  // API基础URL
  apiBaseUrl: string
  // 环境名称
  environment: Environment
  // 是否启用调试模式
  debug: boolean
  // 基础路径
  basePath: string
}

// 从环境变量获取配置
const getEnvVariable = (key: string, defaultValue: string): string => {
  const env = import.meta.env as Record<string, string | undefined>
  return env[key] || defaultValue
}

// 获取当前环境
const getCurrentEnvironment = (): Environment => {
  const env = getEnvVariable('VITE_APP_ENV', 'production')
  if (env === 'uat') return 'uat'
  if (env === 'development') return 'development'
  return 'production'
}

// 开发环境配置
export const developmentConfig: EnvironmentConfig = {
  apiBaseUrl: 'http://localhost:8080/api',
  environment: 'development',
  debug: true,
  basePath: '/',
}

// UAT环境配置
export const uatConfig: EnvironmentConfig = {
  apiBaseUrl: getEnvVariable('VITE_APP_API_BASE_URL', 'http://101.42.252.64:8080/api'),
  environment: 'uat',
  debug: getEnvVariable('VITE_APP_DEBUG', 'true') === 'true',
  basePath: getEnvVariable('VITE_APP_BASE_PATH', '/'),
}

// 生产环境配置
export const productionConfig: EnvironmentConfig = {
  apiBaseUrl: 'http://101.42.252.64:8080/api',
  environment: 'production',
  debug: false,
  basePath: '/HT-financial-system/',
}

// 当前环境
export const currentEnvironment: Environment = getCurrentEnvironment()

// 根据当前环境选择配置
let envConfig: EnvironmentConfig
switch (currentEnvironment) {
  case 'development':
    envConfig = developmentConfig
    break
  case 'uat':
    envConfig = uatConfig
    break
  case 'production':
  default:
    envConfig = productionConfig
    break
}

// 环境标志
export const isDevelopment = currentEnvironment === 'development'
export const isProduction = currentEnvironment === 'production'
export const isUAT = currentEnvironment === 'uat'

// 常用配置项
export const API_BASE_URL = envConfig.apiBaseUrl
export const ENVIRONMENT = envConfig.environment
export const DEBUG_MODE = envConfig.debug
export const BASE_PATH = envConfig.basePath

// 默认导出
export default {
  ...envConfig,
  isDevelopment,
  isProduction,
  isUAT,
  API_BASE_URL,
  ENVIRONMENT,
  DEBUG_MODE,
  BASE_PATH,
  currentEnvironment,
}
