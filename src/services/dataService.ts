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

// 资产类型定义
export interface Asset {
  id: number
  code: string
  name: string
  currentPrice: number
  changePercent: number
  marketValue: number
  industry: string
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

// 模拟获取资产列表
export const getAssets = async (): Promise<Asset[]> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  return generateAssets(50)
}

// 模拟获取投资组合指标
export const getPortfolioMetrics = async (): Promise<PortfolioMetrics> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return generatePortfolioMetrics()
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
export const searchAssets = async (keyword: string, industry?: string): Promise<Asset[]> => {
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
  
  if (industry) {
    filtered = filtered.filter((asset: Asset) => asset.industry === industry)
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
  subscribeToPriceUpdates,
}
