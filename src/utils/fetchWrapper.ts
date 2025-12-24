/**
 * 封装的fetch函数
 * 提供统一的请求处理、错误处理和响应解析
 */

import { API_BASE_URL } from '../config/env'

// 请求配置接口
export interface FetchConfig extends RequestInit {
  // 是否显示加载提示
  showLoading?: boolean
  // 是否显示错误提示
  showError?: boolean
  // 请求超时时间（毫秒）
  timeout?: number
}

// 响应数据接口
export interface FetchResponse<T = unknown> {
  // 响应数据
  data: T
  // 响应状态
  status: number
  // 响应状态文本
  statusText: string
  // 响应头
  headers: Headers
}

// 自定义错误类
export class FetchError extends Error {
  status: number
  statusText: string
  data?: unknown

  constructor(status: number, statusText: string, data?: unknown) {
    super(`${status}: ${statusText}`)
    this.name = 'FetchError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

/**
 * 封装的fetch函数
 * @param endpoint API端点
 * @param config 请求配置
 * @returns 解析后的响应数据
 */
export async function fetchWrapper<T = unknown>(
  endpoint: string,
  config: FetchConfig = {}
): Promise<FetchResponse<T>> {
  const {
    showLoading = true,
    showError = true,
    timeout = 30000,
    ...restConfig
  } = config

  // 显示加载提示
  let loadingMessage: (() => void) | null = null
  if (showLoading && typeof window !== 'undefined') {
    // 动态导入antd的message，避免服务端渲染问题
    const { message } = await import('antd')
    loadingMessage = message.loading('加载中...', 0)
  }

  // 创建超时控制器
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    // 构建完整URL
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${endpoint}`

    // 添加认证令牌
    const token = localStorage.getItem('auth_token')
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // 添加自定义headers
    if (restConfig.headers) {
      const headers = restConfig.headers as Record<string, string>
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          requestHeaders[key] = value
        }
      })
    }
    
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }

    // 发送请求
    const response = await fetch(url, {
      ...restConfig,
      headers: requestHeaders,
      signal: controller.signal,
      // 不自动处理重定向，以便我们可以检查重定向响应
      redirect: 'manual',
    })

    // 清除超时定时器
    clearTimeout(timeoutId)

    // 检查响应状态
    if (!response.ok) {
      // 如果是重定向状态码（3xx），检查是否是认证问题
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        console.warn(`API重定向 (${response.status}): ${location}`)
        
        // 如果是302重定向，可能是认证失败
        if (response.status === 302) {
          throw new FetchError(
            401,
            '认证失败，请重新登录',
            { redirectUrl: location }
          )
        }
      }
      
      let errorData: unknown = null
      try {
        errorData = await response.text()
        // 尝试解析为JSON
        errorData = JSON.parse(errorData as string)
      } catch {
        // 保持为文本格式
      }

      throw new FetchError(
        response.status,
        response.statusText,
        errorData
      )
    }

    // 解析响应数据
    let data: T
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text() as T
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    }
  } catch (error) {
    // 清除超时定时器（如果错误发生在超时之前）
    clearTimeout(timeoutId)

    // 处理错误
    if (error instanceof FetchError) {
      // 显示错误提示
      if (showError && typeof window !== 'undefined') {
        const { message } = await import('antd')
        message.error(`请求失败: ${error.statusText}`)
      }
      throw error
    } else if (error instanceof Error) {
      if (error.name === 'AbortError') {
        const fetchError = new FetchError(408, '请求超时')
        if (showError && typeof window !== 'undefined') {
          const { message } = await import('antd')
          message.error('请求超时，请稍后重试')
        }
        throw fetchError
      } else {
        const fetchError = new FetchError(500, error.message || '网络错误')
        if (showError && typeof window !== 'undefined') {
          const { message } = await import('antd')
          message.error('网络错误，请检查网络连接')
        }
        throw fetchError
      }
    } else {
      const fetchError = new FetchError(500, '未知错误')
      if (showError && typeof window !== 'undefined') {
        const { message } = await import('antd')
        message.error('未知错误，请稍后重试')
      }
      throw fetchError
    }
  } finally {
    // 关闭加载提示
    if (loadingMessage) {
      loadingMessage()
    }
  }
}

/**
 * GET请求
 */
export async function get<T = unknown>(
  endpoint: string,
  config: Omit<FetchConfig, 'method'> = {}
): Promise<FetchResponse<T>> {
  return fetchWrapper<T>(endpoint, {
    method: 'GET',
    ...config,
  })
}

/**
 * POST请求
 */
export async function post<T = unknown>(
  endpoint: string,
  data?: unknown,
  config: Omit<FetchConfig, 'method' | 'body'> = {}
): Promise<FetchResponse<T>> {
  return fetchWrapper<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  })
}

/**
 * PUT请求
 */
export async function put<T = unknown>(
  endpoint: string,
  data?: unknown,
  config: Omit<FetchConfig, 'method' | 'body'> = {}
): Promise<FetchResponse<T>> {
  return fetchWrapper<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  })
}

/**
 * DELETE请求
 */
export async function del<T = unknown>(
  endpoint: string,
  config: Omit<FetchConfig, 'method'> = {}
): Promise<FetchResponse<T>> {
  return fetchWrapper<T>(endpoint, {
    method: 'DELETE',
    ...config,
  })
}

/**
 * PATCH请求
 */
export async function patch<T = unknown>(
  endpoint: string,
  data?: unknown,
  config: Omit<FetchConfig, 'method' | 'body'> = {}
): Promise<FetchResponse<T>> {
  return fetchWrapper<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...config,
  })
}

// 默认导出
export default {
  fetch: fetchWrapper,
  get,
  post,
  put,
  delete: del,
  patch,
  FetchError,
}
