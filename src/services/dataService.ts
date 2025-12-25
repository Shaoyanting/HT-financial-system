import {
  generateAssets,
  generatePortfolioMetrics,
  generateAssetAllocation,
  generateIndustryDistribution,
  generateBenchmarkData,
  generateRiskMetrics,
  generateDrawdownData,
  generateHistoricalPrices,
} from './mockData'
import { get } from '../utils/fetchWrapper'

// 资产类型定义
export interface Asset {
  id: number
  code: string
  name: string
  currentPrice: number
  changePercent: number
  marketValue: number
  assetCategory: string
  position: number
  costPrice: number
  dailyGain: number
  totalGain: number
  weight: number
  pe: number
  pb: number
  dividendYield: number
  volatility: number
  beta: number
  sharpeRatio: number
  maxDrawdown: number
}

// 投资组合指标类型
export interface PortfolioMetrics {
  totalAssets: number
  dailyPnL: number
  totalPnL: number
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  beta: number
  alpha: number
  winRate: number
  avgReturn: number
}

// 资产分配类型
export interface AssetAllocation {
  category: string
  value: number
  color: string
}

// 行业分布类型
export interface IndustryDistribution {
  industry: string
  value: number
  color: string
}

// 基准数据点类型
export interface BenchmarkDataPoint {
  date: string
  value: number
}

// 风险指标类型
export interface RiskMetrics {
  var95: number
  cvar95: number
  stressTestLoss: number
  liquidityRisk: number
  concentrationRisk: number
  creditRisk: number
}

// 回撤数据点类型
export interface DrawdownDataPoint {
  date: string
  price: number
  drawdown: number
}

// 历史价格数据点类型
export interface HistoricalPrice {
  date: string
  price: number
  volume: number
}

// 仪表板指标API响应类型
export interface DashboardMetricsApiResponse {
  success: boolean
  data: {
    totalAssets: number
    dailyPnL: number
    totalPnL: number
    sharpeRatio: number
    maxDrawdown: number
    volatility: number
    beta: number
    alpha: number
    winRate: number
    avgReturn: number
  }
}

// 资产分配API响应类型
export interface DashboardAllocationApiResponse {
  success: boolean
  data: Array<{
    category: string
    value: number
    color: string
  }>
}

// 业绩趋势API响应类型
export interface DashboardPerformanceApiResponse {
  success: boolean
  data: Array<{
    date: string
    portfolio: number
    benchmark: number
  }>
}

// 后端API响应类型
export interface AssetsApiResponse {
  success: boolean
  code: number
  message: string
  data: {
    pagination: {
      total: number
      size: number
      totalPages: number
      page: number
    }
    data: Asset[]
    stats: {
      totalDailyGain: number
      avgChangePercent: number
      count: number
      totalMarketValue: number
    }
  }
  timestamp: number
}

// 获取资产列表参数类型
export interface GetAssetsParams {
  page?: number
  size?: number
  search?: string
  industry?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 从后端API获取资产列表
export const getAssetsFromApi = async (params: GetAssetsParams = {}): Promise<AssetsApiResponse> => {
  try {
    const {
      page = 1,
      size = 10,
      search = '',
      industry = '',
      sortBy = 'currentPrice',
      sortOrder = 'desc',
    } = params

    // 检查用户是否已登录
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('用户未登录，无法获取资产数据')
      throw new Error('用户未登录')
    }

    // 构建查询参数
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      search,
      industry,
      sortBy,
      sortOrder,
    }).toString()

    const response = await get<AssetsApiResponse>(`/assets?${queryParams}`, {
      showLoading: false, // 在页面级别控制加载提示
      showError: false,   // 在页面级别控制错误提示
      timeout: 10000,     // 10秒超时
    })
    
    // 检查响应是否为HTML（备案页面）
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      console.warn('API返回HTML页面，可能是备案页面，使用模拟数据')
      throw new Error('API返回HTML页面')
    }
    
    // 调试日志：打印API响应
    console.log('API响应:', {
      success: response.data.success,
      code: response.data.code,
      message: response.data.message,
      dataLength: response.data.data?.data?.length || 0,
      dataStructure: response.data.data,
      searchParams: params,
    })
    
    return response.data
  } catch (error) {
    console.error('获取资产列表失败:', error)
    
    // 如果是认证错误，抛出以便页面可以处理
    if (error instanceof Error && error.message.includes('认证失败')) {
      throw error
    }
    
    // 如果API调用失败，返回模拟数据
    const { page = 1, size = 10 } = params
    const mockAssets = generateAssets(size)
    return {
      success: false,
      code: 500,
      message: 'API调用失败，使用模拟数据',
      data: {
        pagination: {
          total: 50,
          size,
          totalPages: 5,
          page,
        },
        data: mockAssets,
        stats: {
          totalDailyGain: mockAssets.reduce((sum: number, asset: Asset) => sum + asset.dailyGain, 0),
          avgChangePercent: mockAssets.length > 0
            ? mockAssets.reduce((sum: number, asset: Asset) => sum + asset.changePercent, 0) / mockAssets.length
            : 0,
          count: mockAssets.length,
          totalMarketValue: mockAssets.reduce((sum: number, asset: Asset) => sum + asset.marketValue, 0),
        },
      },
      timestamp: Date.now(),
    }
  }
}

// 模拟获取资产列表（兼容旧代码）
export const getAssets = async (): Promise<Asset[]> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  return generateAssets(50)
}

// 模拟获取投资组合指标（支持日期范围）
export const getPortfolioMetrics = async (startDate?: string, endDate?: string): Promise<PortfolioMetrics> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const metrics = generatePortfolioMetrics()
  
  // 根据日期范围调整数据（模拟）
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    // 根据日期范围调整数据
    if (daysDiff <= 7) {
      // 近7天：数据波动较小
      return {
        ...metrics,
        dailyPnL: metrics.dailyPnL * 0.8,
        volatility: metrics.volatility * 0.7,
        maxDrawdown: metrics.maxDrawdown * 0.6,
      }
    } else if (daysDiff <= 30) {
      // 近30天：中等波动
      return {
        ...metrics,
        dailyPnL: metrics.dailyPnL * 1.2,
        volatility: metrics.volatility * 0.9,
        maxDrawdown: metrics.maxDrawdown * 0.8,
      }
    } else {
      // 更长时间：正常波动
      return metrics
    }
  }
  
  return metrics
}

// 模拟获取资产分配数据
export const getAssetAllocation = async (): Promise<AssetAllocation[]> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return generateAssetAllocation()
}

// 模拟获取行业分布数据
export const getIndustryDistribution = async (): Promise<IndustryDistribution[]> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return generateIndustryDistribution()
}

// 模拟获取基准数据
export const getBenchmarkData = async (days: number = 365): Promise<BenchmarkDataPoint[]> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return generateBenchmarkData(days)
}

// 模拟获取风险指标
export const getRiskMetrics = async (): Promise<RiskMetrics> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return generateRiskMetrics()
}

// 模拟获取回撤数据
export const getDrawdownData = async (days: number = 365): Promise<DrawdownDataPoint[]> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return generateDrawdownData(days)
}

// 模拟获取资产历史价格
export const getAssetHistoricalPrices = async (assetCode: string, days: number = 365): Promise<HistoricalPrice[]> => {
  await new Promise(resolve => setTimeout(resolve, 400))
  return generateHistoricalPrices(assetCode, days)
}

// 模拟搜索资产
export const searchAssets = async (keyword: string, assetCategory?: string): Promise<Asset[]> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const allAssets = generateAssets(50)
  
  let filtered = allAssets
  
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase()
    filtered = filtered.filter((asset: Asset) => 
      asset.code.toLowerCase().includes(lowerKeyword) || 
      asset.name.toLowerCase().includes(lowerKeyword)
    )
  }
  
  if (assetCategory) {
    filtered = filtered.filter((asset: Asset) => asset.assetCategory === assetCategory)
  }
  
  return filtered
}

// 模拟获取资产详情
export const getAssetDetail = async (assetId: number): Promise<Asset | null> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const allAssets = generateAssets(50)
  const asset = allAssets.find((a: Asset) => a.id === assetId)
  return asset || null
}

// 根据ID获取资产（字符串ID版本）
export const getAssetById = async (id: string): Promise<Asset | null> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const allAssets = generateAssets(50)
  const assetId = parseInt(id, 10)
  const asset = allAssets.find((a: Asset) => a.id === assetId)
  return asset || null
}

// 获取资产历史数据
export const getAssetHistory = async (assetId: string, days: number = 30): Promise<Array<{date: string; price: number; volume: number}>> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const prices = generateHistoricalPrices(assetId, days)
  return prices.map((price) => ({
    date: price.date,
    price: price.price,
    volume: price.volume,
  }))
}

// 从后端API获取仪表板指标
export const getDashboardMetricsFromApi = async (dateFrom: string, dateTo: string): Promise<DashboardMetricsApiResponse> => {
  try {
    // 检查用户是否已登录
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('用户未登录，无法获取仪表板数据')
      throw new Error('用户未登录')
    }

    // 构建查询参数
    const queryParams = new URLSearchParams({
      dateFrom,
      dateTo,
    }).toString()

    const response = await get<DashboardMetricsApiResponse>(`/dashboard/metrics?${queryParams}`, {
      showLoading: false, // 在页面级别控制加载提示
      showError: false,   // 在页面级别控制错误提示
      timeout: 10000,     // 10秒超时
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    // 检查响应是否为HTML（备案页面）
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      console.warn('API返回HTML页面，可能是备案页面，使用模拟数据')
      throw new Error('API返回HTML页面')
    }
    
    // 调试日志：打印API响应
    console.log('仪表板API响应:', {
      success: response.data.success,
      data: response.data.data,
      dateFrom,
      dateTo,
    })
    
    return response.data
  } catch (error) {
    console.error('获取仪表板指标失败:', error)
    
    // 如果是认证错误，抛出以便页面可以处理
    if (error instanceof Error && error.message.includes('认证失败')) {
      throw error
    }
    
    // 如果API调用失败，返回模拟数据
    return {
      success: false,
      data: generatePortfolioMetrics(),
    }
  }
}

// 从后端API获取仪表板资产分配数据
export const getDashboardAllocationFromApi = async (dateFrom: string, dateTo: string): Promise<DashboardAllocationApiResponse> => {
  try {
    // 检查用户是否已登录
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('用户未登录，无法获取仪表板数据')
      throw new Error('用户未登录')
    }

    // 构建查询参数
    const queryParams = new URLSearchParams({
      dateFrom,
      dateTo,
    }).toString()

    const response = await get<DashboardAllocationApiResponse>(`/dashboard/allocation?${queryParams}`, {
      showLoading: false, // 在页面级别控制加载提示
      showError: false,   // 在页面级别控制错误提示
      timeout: 10000,     // 10秒超时
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    // 检查响应是否为HTML（备案页面）
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      console.warn('API返回HTML页面，可能是备案页面，使用模拟数据')
      throw new Error('API返回HTML页面')
    }
    
    // 调试日志：打印API响应
    console.log('资产分配API响应:', {
      success: response.data.success,
      data: response.data.data,
      dateFrom,
      dateTo,
    })
    
    return response.data
  } catch (error) {
    console.error('获取资产分配数据失败:', error)
    
    // 如果是认证错误，抛出以便页面可以处理
    if (error instanceof Error && error.message.includes('认证失败')) {
      throw error
    }
    
    // 如果API调用失败，返回模拟数据
    return {
      success: false,
      data: generateAssetAllocation(),
    }
  }
}

// 从后端API获取仪表板业绩趋势数据
export const getDashboardPerformanceFromApi = async (dateFrom: string, dateTo: string): Promise<DashboardPerformanceApiResponse> => {
  try {
    // 检查用户是否已登录
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('用户未登录，无法获取仪表板数据')
      throw new Error('用户未登录')
    }

    // 构建查询参数
    const queryParams = new URLSearchParams({
      dateFrom,
      dateTo,
    }).toString()

    const response = await get<DashboardPerformanceApiResponse>(`/dashboard/performance?${queryParams}`, {
      showLoading: false, // 在页面级别控制加载提示
      showError: false,   // 在页面级别控制错误提示
      timeout: 10000,     // 10秒超时
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    // 检查响应是否为HTML（备案页面）
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      console.warn('API返回HTML页面，可能是备案页面，使用模拟数据')
      throw new Error('API返回HTML页面')
    }
    
    // 调试日志：打印API响应
    console.log('业绩趋势API响应:', {
      success: response.data.success,
      data: response.data.data,
      dateFrom,
      dateTo,
    })
    
    return response.data
  } catch (error) {
    console.error('获取业绩趋势数据失败:', error)
    
    // 如果是认证错误，抛出以便页面可以处理
    if (error instanceof Error && error.message.includes('认证失败')) {
      throw error
    }
    
    // 如果API调用失败，返回模拟数据
    return {
      success: false,
      data: generateBenchmarkData(6).map((point, index) => ({
        date: point.date,
        portfolio: 100 + index * 5,
        benchmark: 100 + index * 3,
      })),
    }
  }
}

// 投资组合趋势数据API响应类型
export interface PortfolioTrendApiResponse {
  success: boolean
  data: Array<{
    date: string
    portfolio: number
    benchmark: number
    volume: number
  }>
}

// 月度收益数据API响应类型
export interface MonthlyReturnsApiResponse {
  success: boolean
  data: Array<{
    month: string
    收益: number
    基准: number
    超额: number
  }>
}

// 趋势分析统计指标API响应类型
export interface TrendStatsApiResponse {
  success: boolean
  data: {
    totalReturn: number
    benchmarkReturn: number
    alpha: number
    beta: number
    sharpeRatio: number
    informationRatio: number
  }
}

// 从后端API获取投资组合趋势数据
export const getPortfolioTrendFromApi = async (dateFrom: string, dateTo: string): Promise<PortfolioTrendApiResponse> => {
  try {
    // 检查用户是否已登录
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('用户未登录，无法获取趋势分析数据')
      throw new Error('用户未登录')
    }

    // 构建查询参数
    const queryParams = new URLSearchParams({
      dateFrom,
      dateTo,
    }).toString()

    const response = await get<PortfolioTrendApiResponse>(`/trend/portfolio?${queryParams}`, {
      showLoading: false, // 在页面级别控制加载提示
      showError: false,   // 在页面级别控制错误提示
      timeout: 10000,     // 10秒超时
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    // 检查响应是否为HTML（备案页面）
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      console.warn('API返回HTML页面，可能是备案页面，使用模拟数据')
      throw new Error('API返回HTML页面')
    }
    
    // 调试日志：打印API响应
    console.log('投资组合趋势数据API响应:', {
      success: response.data.success,
      data: response.data.data,
      dateFrom,
      dateTo,
    })
    
    return response.data
  } catch (error) {
    console.error('获取投资组合趋势数据失败:', error)
    
    // 如果是认证错误，抛出以便页面可以处理
    if (error instanceof Error && error.message.includes('认证失败')) {
      throw error
    }
    
    // 如果API调用失败，返回模拟数据
    return {
      success: false,
      data: [
        { date: '2024-01', portfolio: 100, benchmark: 100, volume: 1200000 },
        { date: '2024-02', portfolio: 105, benchmark: 102, volume: 1350000 },
        { date: '2024-03', portfolio: 108, benchmark: 105, volume: 1500000 },
        { date: '2024-04', portfolio: 112, benchmark: 108, volume: 1650000 },
        { date: '2024-05', portfolio: 115, benchmark: 110, volume: 1800000 },
        { date: '2024-06', portfolio: 118, benchmark: 112, volume: 1950000 },
      ],
    }
  }
}

// 从后端API获取月度收益数据
export const getMonthlyReturnsFromApi = async (dateFrom: string, dateTo: string): Promise<MonthlyReturnsApiResponse> => {
  try {
    // 检查用户是否已登录
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('用户未登录，无法获取趋势分析数据')
      throw new Error('用户未登录')
    }

    // 构建查询参数
    const queryParams = new URLSearchParams({
      dateFrom,
      dateTo,
    }).toString()

    const response = await get<MonthlyReturnsApiResponse>(`/trend/monthly-returns?${queryParams}`, {
      showLoading: false, // 在页面级别控制加载提示
      showError: false,   // 在页面级别控制错误提示
      timeout: 10000,     // 10秒超时
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    // 检查响应是否为HTML（备案页面）
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      console.warn('API返回HTML页面，可能是备案页面，使用模拟数据')
      throw new Error('API返回HTML页面')
    }
    
    // 调试日志：打印API响应
    console.log('月度收益数据API响应:', {
      success: response.data.success,
      data: response.data.data,
      dateFrom,
      dateTo,
    })
    
    return response.data
  } catch (error) {
    console.error('获取月度收益数据失败:', error)
    
    // 如果是认证错误，抛出以便页面可以处理
    if (error instanceof Error && error.message.includes('认证失败')) {
      throw error
    }
    
    // 如果API调用失败，返回模拟数据
    return {
      success: false,
      data: [
        { month: '1月', 收益: 2.5, 基准: 1.8, 超额: 0.7 },
        { month: '2月', 收益: 3.2, 基准: 2.1, 超额: 1.1 },
        { month: '3月', 收益: 2.8, 基准: 2.0, 超额: 0.8 },
        { month: '4月', 收益: 3.5, 基准: 2.5, 超额: 1.0 },
        { month: '5月', 收益: 2.9, 基准: 2.2, 超额: 0.7 },
        { month: '6月', 收益: 3.8, 基准: 2.8, 超额: 1.0 },
      ],
    }
  }
}

// 从后端API获取趋势分析统计指标
export const getTrendStatsFromApi = async (dateFrom: string, dateTo: string): Promise<TrendStatsApiResponse> => {
  try {
    // 检查用户是否已登录
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('用户未登录，无法获取趋势分析数据')
      throw new Error('用户未登录')
    }

    // 构建查询参数
    const queryParams = new URLSearchParams({
      dateFrom,
      dateTo,
    }).toString()

    const response = await get<TrendStatsApiResponse>(`/trend/stats?${queryParams}`, {
      showLoading: false, // 在页面级别控制加载提示
      showError: false,   // 在页面级别控制错误提示
      timeout: 10000,     // 10秒超时
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    // 检查响应是否为HTML（备案页面）
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      console.warn('API返回HTML页面，可能是备案页面，使用模拟数据')
      throw new Error('API返回HTML页面')
    }
    
    // 调试日志：打印API响应
    console.log('趋势分析统计指标API响应:', {
      success: response.data.success,
      data: response.data.data,
      dateFrom,
      dateTo,
    })
    
    return response.data
  } catch (error) {
    console.error('获取趋势分析统计指标失败:', error)
    
    // 如果是认证错误，抛出以便页面可以处理
    if (error instanceof Error && error.message.includes('认证失败')) {
      throw error
    }
    
    // 如果API调用失败，返回模拟数据
    return {
      success: false,
      data: {
        totalReturn: 35.0,
        benchmarkReturn: 28.0,
        alpha: 7.0,
        beta: 0.95,
        sharpeRatio: 1.8,
        informationRatio: 0.9,
      },
    }
  }
}

// 资产详情API响应类型
export interface AssetDetailApiResponse {
  success: boolean
  data: Asset
}

// 从后端API获取资产详情
export const getAssetDetailFromApi = async (assetId: string): Promise<AssetDetailApiResponse> => {
  try {
    // 检查用户是否已登录
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('用户未登录，无法获取资产详情')
      throw new Error('用户未登录')
    }

    const response = await get<AssetDetailApiResponse>(`/assets/${assetId}`, {
      showLoading: false, // 在页面级别控制加载提示
      showError: false,   // 在页面级别控制错误提示
      timeout: 10000,     // 10秒超时
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    // 检查响应是否为HTML（备案页面）
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      console.warn('API返回HTML页面，可能是备案页面，使用模拟数据')
      throw new Error('API返回HTML页面')
    }
    
    // 调试日志：打印API响应
    console.log('资产详情API响应:', {
      success: response.data.success,
      data: response.data.data,
      assetId,
    })
    
    return response.data
  } catch (error) {
    console.error('获取资产详情失败:', error)
    
    // 如果是认证错误，抛出以便页面可以处理
    if (error instanceof Error && error.message.includes('认证失败')) {
      throw error
    }
    
    // 如果API调用失败，返回模拟数据
    return {
      success: false,
      data: generateAssets(1)[0],
    }
  }
}

// 模拟更新资产价格（用于实时更新演示）
export const subscribeToPriceUpdates = (callback: (assets: Asset[]) => void): () => void => {
  const interval = setInterval(() => {
    const updatedAssets = generateAssets(5).map((asset: Asset) => ({
      ...asset,
      currentPrice: asset.currentPrice * (1 + (Math.random() - 0.5) * 0.02),
      changePercent: (Math.random() - 0.5) * 10,
    }))
    callback(updatedAssets)
  }, 5000)
  
  return () => clearInterval(interval)
}

export default {
  getAssets,
  getPortfolioMetrics,
  getAssetAllocation,
  getIndustryDistribution,
  getBenchmarkData,
  getRiskMetrics,
  getDrawdownData,
  getAssetHistoricalPrices,
  searchAssets,
  getAssetDetail,
  getAssetDetailFromApi,
  subscribeToPriceUpdates,
}
