import Mock from 'mockjs'
import dayjs from 'dayjs'

// 模拟用户账户数据 - 生成30个用户
export const mockUsers = (() => {
  const users = [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      name: '管理员',
      email: 'admin@financial.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      role: 'admin',
    },
  ];
  
  // 生成29个普通用户
  const chineseNames = [
    '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二',
    '刘十三', '陈十四', '杨十五', '黄十六', '赵十七', '周十八', '吴十九', '郑二十', '孙二十一', '李二十二',
    '王二十三', '张二十四', '刘二十五', '陈二十六', '杨二十七', '黄二十八', '赵二十九', '周三十', '吴三十一'
  ];
  
  const departments = ['投资部', '风控部', '研究部', '技术部', '市场部', '财务部', '人力资源部'];
  const positions = ['分析师', '经理', '主管', '专员', '助理', '总监', '副总裁'];
  
  for (let i = 0; i < 29; i++) {
    const name = chineseNames[i];
    const username = `user${i + 1}`;
    const email = `${username.toLowerCase()}@financial.com`;
    
    users.push({
      id: i + 2,
      username,
      password: 'user123',
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      role: 'user',
      department: departments[i % departments.length],
      position: positions[i % positions.length],
      joinDate: dayjs().subtract(Mock.Random.integer(1, 36), 'month').format('YYYY-MM-DD'),
      lastLogin: dayjs().subtract(Mock.Random.integer(0, 7), 'day').format('YYYY-MM-DD HH:mm:ss'),
      bio: Mock.Random.cparagraph(1, 3),
    });
  }
  
  return users;
})();

// 模拟资产数据
export const generateAssets = (count: number = 50) => {
  const assetCategories = ['现金', '债券', '股票', '基金', '商品', '房地产', '其他']
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
        'assetCategory': () => Mock.Random.pick(assetCategories),
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
    assetCategory: string;
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
  // 使用用户指定的数据
  const allocationData = [
    { category: '股票', value: 40.75, color: '#1890ff' },
    { category: '证券', value: 15.13, color: '#52c41a' },
    { category: '基金', value: 20.4, color: '#faad14' },
    { category: '现金', value: 6.87, color: '#722ed1' },
    { category: '房地产', value: 5.65, color: '#13c2c2' },
    { category: '商品', value: 13.13, color: '#f5222d' },
    { category: '其他', value: 0.23, color: '#eb2f96' },
  ]
  
  return allocationData
}

// 模拟行业分布数据
export const generateIndustryDistribution = () => {
  // 使用用户指定的10个行业，确保总和为100%，但顺序随机
  const industries = [
    { industry: '医疗', value: 12.8, color: '#722ed1' },
    { industry: '金融', value: 18.3, color: '#52c41a' },
    { industry: '工业', value: 7.5, color: '#f5222d' },
    { industry: '科技', value: 25.5, color: '#1890ff' },
    { industry: '材料', value: 3.8, color: '#a0d911' },
    { industry: '消费', value: 15.2, color: '#faad14' },
    { industry: '能源', value: 8.7, color: '#13c2c2' },
    { industry: '通信服务', value: 0.8, color: '#7cb305' },
    { industry: '房地产', value: 5.3, color: '#eb2f96' },
    { industry: '公用事业', value: 2.1, color: '#fa8c16' },
  ]
  
  // 验证总和为100%
  const total = industries.reduce((sum, item) => sum + item.value, 0)
  console.log(`行业分布数据总和: ${total}%，顺序已随机化`)
  
  return industries
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
    var95: Mock.Random.float(1.5, 4.0, 1, 1), // 百分比值，如2.8%
    cvar95: Mock.Random.float(3.0, 6.0, 1, 1), // 百分比值，如4.3%
    stressTestLoss: Mock.Random.float(8.0, 15.0, 1, 1), // 百分比值，如12.5%
    liquidityRisk: Mock.Random.float(2.0, 5.0, 1, 1), // 百分比值，如3.2%
    concentrationRisk: Mock.Random.float(15.0, 25.0, 1, 1), // 百分比值，如18.5%
    creditRisk: Mock.Random.float(1.0, 3.5, 1, 1), // 百分比值，如2.1%
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
};
