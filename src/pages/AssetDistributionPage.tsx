import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Select, Space, Button, Radio, Statistic, Tabs, message } from 'antd'
import { PieChartOutlined, BarChartOutlined } from '@ant-design/icons'
import { TrendingUp, RefreshCw } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { getAssetAllocation, getIndustryDistribution } from '../services/dataService'
import type { AssetAllocation, IndustryDistribution } from '../services/dataService'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

const AssetDistributionPage: React.FC = () => {
  // 初始状态
  const initialViewType = 'pie'
  const initialAssetCategory = 'all'
  const initialTimeRange = 'current'

  const [allocationData, setAllocationData] = useState<AssetAllocation[]>([])
  const [industryData, setIndustryData] = useState<IndustryDistribution[]>([])
  const [viewType, setViewType] = useState(initialViewType)
  const [assetCategory, setAssetCategory] = useState(initialAssetCategory)
  const [timeRange, setTimeRange] = useState(initialTimeRange)

  // 根据筛选条件获取数据
  const fetchData = async (category: string, range: string) => {
    try {
      const [allocation, industry] = await Promise.all([
        getAssetAllocation(),
        getIndustryDistribution(),
      ])
      
      // 根据资产类别筛选数据
      let filteredAllocation = allocation
      if (category !== 'all') {
        // 当选择特定类别时，显示该类别下的细分数据
        filteredAllocation = generateSubCategoryData(category)
      }
      
      // 根据时间范围筛选数据（这里模拟不同时间范围的数据）
      let filteredIndustry = industry
      if (range === 'historical') {
        // 历史数据：模拟不同的行业分布
        filteredIndustry = industry.map(item => ({
          ...item,
          value: item.value * (0.8 + Math.random() * 0.4) // 随机变化
        }))
      } else if (range === 'target') {
        // 目标数据：模拟目标配置
        filteredIndustry = industry.map(item => ({
          ...item,
          value: item.value * (0.9 + Math.random() * 0.2) // 接近当前值
        }))
      }
      
      setAllocationData(filteredAllocation)
      setIndustryData(filteredIndustry)
    } catch (error) {
      console.error('加载资产分布数据错误:', error)
    }
  }

  // 生成特定类别下的细分数据
  const generateSubCategoryData = (category: string) => {
    const categoryMap: Record<string, Array<{name: string, value: number, color: string}>> = {
      stock: [
        { name: 'A股', value: 40, color: '#1890ff' },
        { name: '港股', value: 25, color: '#52c41a' },
        { name: '美股', value: 35, color: '#faad14' },
      ],
      bond: [
        { name: '国债', value: 45, color: '#722ed1' },
        { name: '企业债', value: 35, color: '#13c2c2' },
        { name: '地方政府债', value: 20, color: '#f5222d' },
      ],
      cash: [
        { name: '活期存款', value: 60, color: '#1890ff' },
        { name: '定期存款', value: 25, color: '#52c41a' },
        { name: '货币基金', value: 15, color: '#faad14' },
      ],
      alternative: [
        { name: '房地产', value: 50, color: '#722ed1' },
        { name: '私募股权', value: 30, color: '#13c2c2' },
        { name: '大宗商品', value: 20, color: '#f5222d' },
      ],
    }
    
    const subCategories = categoryMap[category] || []
    
    // 转换为AssetAllocation格式
    return subCategories.map(item => ({
      category: item.name,
      value: item.value,
      color: item.color,
    }))
  }

  // 初始化数据
  useEffect(() => {
    fetchData(initialAssetCategory, initialTimeRange)
  }, [])

  // 资产类别变化时重新获取数据
  useEffect(() => {
    fetchData(assetCategory, timeRange)
  }, [assetCategory])

  // 时间范围变化时重新获取数据
  useEffect(() => {
    fetchData(assetCategory, timeRange)
  }, [timeRange])

  // 处理刷新 - 重置所有筛选条件并重新获取数据
  const handleRefresh = () => {
    setViewType(initialViewType)
    setAssetCategory(initialAssetCategory)
    setTimeRange(initialTimeRange)
    
    fetchData(initialAssetCategory, initialTimeRange)
    
    message.success('数据已刷新，筛选条件已重置')
  }

  // 处理饼图数据
  const pieChartData = allocationData.map(item => ({
    name: item.category,
    value: item.value,
    color: item.color,
  }))

  // 处理树图数据
  const treemapData = industryData.map(item => ({
    name: item.industry,
    size: item.value,
    color: item.color,
  }))

  // 处理雷达图数据
  const radialData = allocationData.map(item => ({
    name: item.category,
    value: item.value,
    fill: item.color,
  }))

  // 统计信息
  const stats = {
    totalAssets: 125000000,
    stockPercentage: 65.5,
    bondPercentage: 25.3,
    cashPercentage: 9.2,
    topIndustry: '科技',
    topIndustryPercentage: 32.8,
    diversificationScore: 8.5,
  }

  // 模拟历史配置变化
  const historicalAllocation = [
    { date: '2024-01', 股票: 62.5, 债券: 28.5, 现金: 9.0 },
    { date: '2024-02', 股票: 63.2, 债券: 27.8, 现金: 9.0 },
    { date: '2024-03', 股票: 64.1, 债券: 26.9, 现金: 9.0 },
    { date: '2024-04', 股票: 65.0, 债券: 26.0, 现金: 9.0 },
    { date: '2024-05', 股票: 65.5, 债券: 25.5, 现金: 9.0 },
    { date: '2024-06', 股票: 66.2, 债券: 24.8, 现金: 9.0 },
    { date: '2024-07', 股票: 66.8, 债券: 24.2, 现金: 9.0 },
    { date: '2024-08', 股票: 67.5, 债券: 23.5, 现金: 9.0 },
    { date: '2024-09', 股票: 66.9, 债券: 24.1, 现金: 9.0 },
    { date: '2024-10', 股票: 66.3, 债券: 24.7, 现金: 9.0 },
    { date: '2024-11', 股票: 65.8, 债券: 25.2, 现金: 9.0 },
    { date: '2024-12', 股票: 65.5, 债券: 25.3, 现金: 9.2 },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>资产分布</Title>
        <Text type="secondary">分析投资组合的资产配置、行业分布和地域分布</Text>
      </div>

      {/* 控制面板 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>资产类别</Text>
              <Select 
                value={assetCategory} 
                onChange={setAssetCategory}
                style={{ width: '100%' }}
              >
                <Option value="all">所有资产</Option>
                <Option value="stock">股票</Option>
                <Option value="bond">债券</Option>
                <Option value="cash">现金</Option>
                <Option value="alternative">另类投资</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={10}>
            <Space style={{ float: 'right' }}>
              <Button icon={<RefreshCw size={16} />} onClick={handleRefresh}>刷新</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="总资产"
              value={stats.totalAssets}
              formatter={(value) => `¥${(value as number).toLocaleString()}`}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TrendingUp size={16} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="股票占比"
              value={stats.stockPercentage}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="债券占比"
              value={stats.bondPercentage}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="现金占比"
              value={stats.cashPercentage}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="最大行业"
              value={stats.topIndustry}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="分散化评分"
              value={stats.diversificationScore}
              precision={1}
              suffix="/10"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要图表区域 */}
      <Tabs defaultActiveKey="1" type="card">
        <TabPane
          tab={
            <span>
              <PieChartOutlined />
              大类资产配置
            </span>
          }
          key="1"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title="当前资产配置"
                extra={
                  <Space>
                    <Text strong style={{ marginRight: 8 }}>视图类型:</Text>
                    <Radio.Group 
                      value={viewType} 
                      onChange={(e) => setViewType(e.target.value)}
                      size="small"
                    >
                      <Radio.Button value="pie">饼图</Radio.Button>
                      <Radio.Button value="bar">柱状图</Radio.Button>
                      <Radio.Button value="radial">雷达图</Radio.Button>
                    </Radio.Group>
                  </Space>
                }
              >
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {viewType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, '占比']} />
                        <Legend />
                      </PieChart>
                    ) : viewType === 'radial' ? (
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="10%"
                        outerRadius="80%"
                        data={radialData}
                      >
                        <RadialBar
                          label={{ position: 'insideStart', fill: '#fff' }}
                          background
                          dataKey="value"
                        />
                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                        <Tooltip formatter={(value) => [`${value}%`, '占比']} />
                      </RadialBarChart>
                    ) : (
                      <BarChart data={pieChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: '占比 (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`${value}%`, '占比']} />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="历史配置变化">
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalAllocation}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: '占比 (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value}%`, '占比']} />
                      <Legend />
                      <Bar dataKey="股票" stackId="a" fill="#1890ff" />
                      <Bar dataKey="债券" stackId="a" fill="#52c41a" />
                      <Bar dataKey="现金" stackId="a" fill="#faad14" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BarChartOutlined />
              行业分布
            </span>
          }
          key="2"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="行业分布">
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {viewType === 'tree' ? (
                      <Treemap
                        data={treemapData}
                        dataKey="size"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        fill="#8884d8"
                      >
                        <Tooltip formatter={(value) => [`${value}%`, '占比']} />
                      </Treemap>
                    ) : (
                      <BarChart
                        data={industryData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="industry" />
                        <Tooltip formatter={(value) => [`${value}%`, '占比']} />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                          {industryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="行业集中度分析" style={{height:'100%'}}>
                <div style={{ padding: 24 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>前三大行业集中度</Text>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>科技行业</span>
                        <span>32.8%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>金融行业</span>
                        <span>18.5%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>消费行业</span>
                        <span>15.2%</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>行业分散化评分</Text>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1, height: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
                          <div style={{ width: '85%', height: '100%', backgroundColor: '#52c41a', borderRadius: 4 }} />
                        </div>
                        <span style={{ marginLeft: 8 }}>8.5/10</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Text strong>建议</Text>
                    <ul style={{ marginTop: 8 }}>
                      <li>科技行业占比偏高，建议适当分散到其他行业</li>
                      <li>考虑增加医疗、工业等行业的配置</li>
                      <li>关注新兴行业如新能源、人工智能的投资机会</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* 分析报告 */}
      <Card title="资产配置分析报告" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div>
              <Title level={4}>配置优势</Title>
              <ul>
                <li>股票配置比例合理，符合长期增长目标</li>
                <li>债券配置提供稳定的现金流和风险缓冲</li>
                <li>现金比例适当，保持流动性充足</li>
                <li>行业分布相对均衡，分散化程度良好</li>
              </ul>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div>
              <Title level={4}>改进建议</Title>
              <ul>
                <li>考虑增加国际资产的配置以分散地域风险</li>
                <li>适当降低科技行业集中度，增加其他行业配置</li>
                <li>探索另类投资机会，如房地产、私募股权等</li>
                <li>定期进行资产再平衡，维持目标配置比例</li>
              </ul>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default AssetDistributionPage
