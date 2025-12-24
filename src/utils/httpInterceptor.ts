/**
 * HTTP响应拦截工具
 * 用于处理HTTP请求和响应的拦截、错误处理、日志记录等
 */

import { message } from 'antd'
import { API_BASE_URL } from '../config/env'

// 请求配置接口
export interface RequestConfig extends RequestInit {
  // 是否显示加载提示
  showLoading?: boolean
  // 是否显示错误提示
  showError?: boolean
  // 请求超时时间（毫秒）
  timeout?: number
  // 请求头
  headers?: Record<string, string>
}

// 响应数据接口
export interface ResponseData<T = unknown> {
  // 状态码
  code: number
  // 响应消息
  message: string
  // 响应数据
  data: T
  // 是否成功
  success: boolean
}

// 自定义错误类
export class HttpError extends Error {
  code: number
  data?: unknown

  constructor(code: number, message: string, data?: unknown) {
    super(message)
    this.name = 'HttpError'
    this.code = code
    this.data = data
  }
}

// 请求拦截器类型
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
// 响应拦截器类型
export type ResponseInterceptor<T = unknown> = (response: ResponseData<T>) => ResponseData<T> | Promise<ResponseData<T>>
// 错误拦截器类型
export type ErrorInterceptor = (error: HttpError) => void | Promise<void>

// HTTP拦截器管理器
class HttpInterceptor {
  // 请求拦截器列表
  private requestInterceptors: RequestInterceptor[] = []
  // 响应拦截器列表
  private responseInterceptors: ResponseInterceptor[] = []
  // 错误拦截器列表
  private errorInterceptors: ErrorInterceptor[] = []

  // 添加请求拦截器
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  // 添加响应拦截器
  addResponseInterceptor<T = unknown>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor)
  }

  // 添加错误拦截器
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  // 执行请求拦截器链
  private async executeRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let result = { ...config }
    
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result)
    }
    
    return result
  }

  // 执行响应拦截器链
  private async executeResponseInterceptors<T>(response: ResponseData<T>): Promise<ResponseData<T>> {
    let result: ResponseData<T> = { ...response }
    
    for (const interceptor of this.responseInterceptors) {
      const processed = await interceptor(result)
      // 类型断言，因为我们知道拦截器会返回相同类型的数据
      result = processed as ResponseData<T>
    }
    
    return result
  }

  // 执行错误拦截器链
  private async executeErrorInterceptors(error: HttpError): Promise<void> {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error)
    }
  }

  // 发送HTTP请求
  async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ResponseData<T>> {
    const {
      showLoading = true,
      showError = true,
      timeout = 30000,
      headers = {},
      ...restConfig
    } = config

    // 显示加载提示
    let loadingMessage: (() => void) | null = null
    if (showLoading) {
      loadingMessage = message.loading('加载中...', 0)
    }

    try {
      // 执行请求拦截器
      const requestConfig = await this.executeRequestInterceptors({
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        ...restConfig,
      })

      // 创建超时控制器
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      // 构建完整URL
      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_BASE_URL}${endpoint}`

      // 发送请求
      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      })

      // 清除超时定时器
      clearTimeout(timeoutId)

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text().catch(() => null)
        throw new HttpError(
          response.status,
          `HTTP错误: ${response.status} ${response.statusText}`,
          errorText
        )
      }

      // 解析响应数据
      const responseData: ResponseData<T> = await response.json()

      // 检查业务状态码
      if (!responseData.success && responseData.code !== 200) {
        throw new HttpError(
          responseData.code,
          responseData.message || '请求失败',
          responseData.data
        )
      }

      // 执行响应拦截器
      const processedData = await this.executeResponseInterceptors(responseData)

      return processedData
    } catch (error) {
      // 处理错误
      let httpError: HttpError
      
      if (error instanceof HttpError) {
        httpError = error
      } else if (error instanceof Error) {
        if (error.name === 'AbortError') {
          httpError = new HttpError(408, '请求超时')
        } else {
          httpError = new HttpError(500, error.message || '网络错误')
        }
      } else {
        httpError = new HttpError(500, '未知错误')
      }

      // 执行错误拦截器
      await this.executeErrorInterceptors(httpError)

      // 显示错误提示
      if (showError) {
        message.error(httpError.message)
      }

      throw httpError
    } finally {
      // 关闭加载提示
      if (loadingMessage) {
        loadingMessage()
      }
    }
  }

  // GET请求
  async get<T = unknown>(
    endpoint: string,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<ResponseData<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...config,
    })
  }

  // POST请求
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<ResponseData<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })
  }

  // PUT请求
  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<ResponseData<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })
  }

  // DELETE请求
  async delete<T = unknown>(
    endpoint: string,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<ResponseData<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...config,
    })
  }

  // PATCH请求
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<ResponseData<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })
  }
}

// 创建全局HTTP拦截器实例
export const httpInterceptor = new HttpInterceptor()

// 添加默认请求拦截器 - 添加认证令牌
httpInterceptor.addRequestInterceptor(async (config) => {
  // 从localStorage获取认证令牌
  const token = localStorage.getItem('auth_token')
  
  if (token) {
    return {
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      },
    }
  }
  
  return config
})

// 添加默认响应拦截器 - 处理通用响应格式
httpInterceptor.addResponseInterceptor(async (response) => {
  // 可以在这里处理通用的响应数据转换
  // 例如：统一处理分页数据格式等
  
  return response
})

// 添加默认错误拦截器 - 处理认证错误
httpInterceptor.addErrorInterceptor(async (error) => {
  // 处理认证错误（401）
  if (error.code === 401) {
    // 清除本地存储的认证信息
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
    
    // 跳转到登录页面
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }
  
  // 记录错误日志
  console.error('HTTP请求错误:', {
    code: error.code,
    message: error.message,
    data: error.data,
    timestamp: new Date().toISOString(),
  })
})

// 导出常用的HTTP方法
export const http = {
  // 原始请求方法
  request: httpInterceptor.request.bind(httpInterceptor),
  // 快捷方法
  get: httpInterceptor.get.bind(httpInterceptor),
  post: httpInterceptor.post.bind(httpInterceptor),
  put: httpInterceptor.put.bind(httpInterceptor),
  delete: httpInterceptor.delete.bind(httpInterceptor),
  patch: httpInterceptor.patch.bind(httpInterceptor),
  // 拦截器管理
  addRequestInterceptor: httpInterceptor.addRequestInterceptor.bind(httpInterceptor),
  addResponseInterceptor: httpInterceptor.addResponseInterceptor.bind(httpInterceptor),
  addErrorInterceptor: httpInterceptor.addErrorInterceptor.bind(httpInterceptor),
}

// 默认导出
export default http
