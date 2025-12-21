import Mock from 'mockjs'
import dayjs from 'dayjs'

// 模拟用户账户数据
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: '管理员',
    email: 'admin@financial.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin',
  },
  {
    id: 2,
    username: 'user1',
    password: 'user123',
    name: '张三',
    email: 'zhangsan@financial.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    role: 'user',
  },
]

// 模拟资产数据
export const generateAssets = (count: number = 50) => {
  const industries = ['科技', '金融', '消费', '医疗', '能源', '工业', '房地产', '材料', '公用事业', '通信服务']
  const assetCodes = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'JPM', 'V', 'JNJ', 'WMT', 'PG', 'UNH', 'HD', 'BAC', 'MA']
  
  return Mock.mock({
    [`list|${count}`]: [
      {
        'id|+1': 1,
        'code': () => Mock.Random.pick(assetCodes),
        'name': '@cword(3,6)股份有限公司',
        'currentPrice|100-5000.2': 1,
        'changePercent|0.1-15.2': 1,
        'marketValue|1000000-1000000000.2': 1,
        'industry': () => Mock.Random.pick(industries),
        'position|1000-100000': 1,
        'costPrice|80-3000.2': 1,
        'dailyGain|1000-50000.2': 1,
        'totalGain|10000-500000.2': 1,
        'weight|0.1-20.2': 1,
        'pe|5-50.2': 1,
        'pb|0.5-10.2': 1,
        'dividendYield|0.1-5.2': 1,
        'volatility|0.1-3.2': 1,
        'beta|0.5-1.5': 1,
        'sharpeRatio|0.1-2.5': 1,
        'maxDrawdown|5-30.2': 1,
      },
    ],
  }).list.map((asset: {
    id: number;
    code: string;
    name: string;
    currentPrice: number;
    changePercent: number;
    marketValue: number;
    industry: string;
    position: number;
    costPrice: number;
    dailyGain: number;
    totalGain: number;
    weight: number;
    pe: number;
    pb: number;
    dividendYield: number;
    volatility: number;
    beta: number;
    sharpeRatio: number;
    maxDrawdown: number;
  }) => ({
    ...asset,
    changePercent: Mock.Random.boolean() ? asset.changePercent : -asset.changePercent,
    dailyGain: asset.changePercent > 0 ? asset.dailyGain : -asset.dailyGain,
    totalGain: asset.changePercent > 0 ? asset.totalGain : -asset.totalGain,
  }))
}

// 模拟历史价格数据（过去365天）
export const generateHistoricalPrices = (_assetCode: string, days: number = 365) => {
  const startPrice = Mock.Random.float(100, 5000, 2, 2)
  const prices = []
  let currentPrice = startPrice
  
  const startDate = dayjs().subtract(days, 'day')
  
  for (let i = 0; i < days; i++) {
    const date = startDate.add(i, 'day').format('YYYY-MM-DD')
    const change = Mock.Random.float(-0.05, 0.05, 3, 3)
    currentPrice = currentPrice * (1 + change)
    
    prices.push({
      date,
      price: parseFloat(currentPrice.toFixed(2)),
      volume: Mock.Random.integer(100000, 10000000),
    })
  }
  
  return prices
}

// 模拟投资组合指标
export const generatePortfolioMetrics = () => {
  const totalAssets = Mock.Random.float(1000000, 10000000, 2, 2)
  const dailyPnL = Mock.Random.float(-50000, 100000, 2, 2)
  const totalPnL = Mock.Random.float(-200000, 500000, 2, 2)
  
  return {
    totalAssets,
    dailyPnL,
    totalPnL,
    sharpeRatio: Mock.Random.float(0.5, 2.5, 2, 2),
    maxDrawdown: Mock.Random.float(5, 25, 2, 2),
    volatility: Mock.Random.float(0.5, 2.5, 2, 2),
    beta: Mock.Random.float(0.8, 1.2, 2, 2),
    alpha: Mock.Random.float(-0.05, 0.05, 3, 3),
    winRate: Mock.Random.float(50, 80, 2, 2),
    avgReturn: Mock.Random.float(0.1, 1.5, 2, 2),
  }
}

// 模拟资产分布数据
export const generateAssetAllocation = () => {
  const categories = ['股票', '债券', '现金', '商品', '房地产', '其他']
  
  return categories.map(category => ({
    category,
    value: Mock.Random.float(5, 40, 2, 2),
    color: Mock.Random.color(),
  }))
}

// 模拟行业分布数据
export const generateIndustryDistribution = () => {
  const industries = ['科技', '金融', '消费', '医疗', '能源', '工业', '房地产', '材料', '公用事业', '通信服务']
  
  return industries.map(industry => ({
    industry,
    value: Mock.Random.float(5, 25, 2, 2),
    color: Mock.Random.color(),
  }))
}

// 模拟基准指数数据
export const generateBenchmarkData = (days: number = 365) => {
  const startValue = 1000
  const values = []
  let currentValue = startValue
  
  const startDate = dayjs().subtract(days, 'day')
  
  for (let i = 0; i < days; i++) {
    const date = startDate.add(i, 'day').format('YYYY-MM-DD')
    const change = Mock.Random.float(-0.03, 0.03, 3, 3)
    currentValue = currentValue * (1 + change)
    
    values.push({
      date,
      value: parseFloat(currentValue.toFixed(2)),
    })
  }
  
  return values
}

// 模拟风险指标数据
export const generateRiskMetrics = () => {
  return {
    var95: Mock.Random.float(10000, 50000, 2, 2),
    cvar95: Mock.Random.float(15000, 60000, 2, 2),
    stressTestLoss: Mock.Random.float(50000, 200000, 2, 2),
    liquidityRisk: Mock.Random.float(0.1, 0.5, 2, 2),
    concentrationRisk: Mock.Random.float(0.2, 0.8, 2, 2),
    creditRisk: Mock.Random.float(0.1, 0.4, 2, 2),
  }
}

// 模拟回撤数据
export const generateDrawdownData = (days: number = 365) => {
  const data = []
  const startDate = dayjs().subtract(days, 'day')
  let maxPrice = 1000
  let currentPrice = 1000
  
  // 确保生成足够的数据点，但不要太多（对于图表来说30-100个点就够了）
  const step = Math.max(1, Math.floor(days / 100))
  
  for (let i = 0; i < days; i += step) {
    const date = startDate.add(i, 'day').format('YYYY-MM-DD')
    const change = Mock.Random.float(-0.02, 0.02, 3, 3)
    currentPrice = currentPrice * (1 + change)
    
    if (currentPrice > maxPrice) {
      maxPrice = currentPrice
    }
    
    const drawdown = ((currentPrice - maxPrice) / maxPrice) * 100
    
    data.push({
      date,
      price: parseFloat(currentPrice.toFixed(2)),
      drawdown: parseFloat(drawdown.toFixed(2)),
    })
  }
  
  // 确保数据不为空
  if (data.length === 0) {
    data.push({
      date: startDate.format('YYYY-MM-DD'),
      price: 1000,
      drawdown: 0,
    })
  }
  
  return data
}

export default {
  mockUsers,
  generateAssets,
  generateHistoricalPrices,
  generatePortfolioMetrics,
  generateAssetAllocation,
  generateIndustryDistribution,
  generateBenchmarkData,
  generateRiskMetrics,
  generateDrawdownData,
}
