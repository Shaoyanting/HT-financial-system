/**
 * 环境配置
 * 用于管理不同环境的API基础URL和其他配置
 * 根据用户要求，当前设置为prod环境
 */

// 环境类型定义
export type Environment = 'development' | 'production'

// 环境配置接口
export interface EnvironmentConfig {
  // API基础URL
  apiBaseUrl: string
  // 环境名称
  environment: Environment
  // 是否启用调试模式
  debug: boolean
}

// 开发环境配置
export const developmentConfig: EnvironmentConfig = {
  apiBaseUrl: 'http://localhost:8080/api',
  environment: 'development',
  debug: true,
}

// 生产环境配置（当前使用）
export const productionConfig: EnvironmentConfig = {
  apiBaseUrl: 'http://101.42.252.64:8080/api',
  environment: 'production',
  debug: false,
}

// 当前环境配置 - 根据用户要求设置为生产环境
export const currentEnvironment: Environment = 'production'

// 当前配置
export const envConfig: EnvironmentConfig = productionConfig

// 环境标志
export const isDevelopment = false
export const isProduction = true

// 常用配置项
export const API_BASE_URL = envConfig.apiBaseUrl
export const ENVIRONMENT = envConfig.environment
export const DEBUG_MODE = envConfig.debug

// 默认导出
export default {
  ...envConfig,
  isDevelopment,
  isProduction,
  API_BASE_URL,
  ENVIRONMENT,
  DEBUG_MODE,
  currentEnvironment,
}
