import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Select, DatePicker, Space, Button, Tabs, Statistic } from 'antd'
import { LineChartOutlined, PieChartOutlined, BarChartOutlined, DownloadOutlined } from '@ant-design/icons'
import { TrendingUp, RefreshCw } from 'lucide-react'
import {
  LineChart,
  Line,
  PieChart as RechartsPieChart,
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
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'
import { getIndustryDistribution, getAssetAllocation } from '../services/dataService'
import type { IndustryDistribution, AssetAllocation } from '../services/dataService'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker
const { TabPane } = Tabs

const ChartsAnalysisPage: React.FC = () => {
  const [industryData, setIndustryData] = useState<IndustryDistribution[]>([])
  const [allocationData, setAllocationData] = useState<AssetAllocation[]>([])
  const [timeRange, setTimeRange] = useState('1y')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [industry, allocation] = await Promise.all([
          getIndustryDistribution(),
          getAssetAllocation(),
        ])
        setIndustryData(industry)
        setAllocationData(allocation)
      } catch (error) {
        console.error('加载图表数据错误:', error)
      }
    }

    fetchData()
  }, [])

  // 模拟投资组合净值数据
  const portfolioData = [
    { date: '2024-01', portfolio: 100, benchmark: 100 },
    { date: '2024-02', portfolio: 105, benchmark: 102 },
    { date: '2024-03', portfolio: 108, benchmark: 105 },
    { date: '2024-04', portfolio: 112, benchmark: 108 },
    { date: '2024-05', portfolio: 115, benchmark: 110 },
    { date: '2024-06', portfolio: 118, benchmark: 112 },
    { date: '2024-07', portfolio: 120, benchmark: 115 },
    { date: '2024-08', portfolio: 122, benchmark: 118 },
    { date: '2024-09', portfolio: 125, benchmark: 120 },
    { date: '2024-10', portfolio: 128, benchmark: 122 },
    { date: '2024-11', portfolio: 130, benchmark: 125 },
    { date: '2024-12', portfolio: 135, benchmark: 128 },
  ]

  // 模拟风险收益数据
  const riskReturnData = [
    { name: '股票', return: 12.5, risk: 18.2, color: '#1890ff' },
    { name: '债券', return: 5.2, risk: 3.8, color: '#52c41a' },
    { name: '现金', return: 2.1, risk: 0.5, color: '#faad14' },
    { name: '商品', return: 8.7, risk: 15.3, color: '#f5222d' },
    { name: '房地产', return: 7.3, risk: 12.1, color: '#722ed1' },
  ]

  // 模拟月度收益数据
  const monthlyReturnData = [
    { month: '1月', 收益: 2.5, 基准: 1.8 },
    { month: '2月', 收益: 3.2, 基准: 2.1 },
    { month: '3月', 收益: 1.8, 基准: 1.5 },
    { month: '4月', 收益: 4.1, 基准: 3.2 },
    { month: '5月', 收益: 2.9, 基准: 2.4 },
    { month: '6月', 收益: 3.5, 基准: 2.8 },
    { month: '7月', 收益: 2.1, 基准: 1.9 },
    { month: '8月', 收益: 3.8, 基准: 3.1 },
    { month: '9月', 收益: 2.7, 基准: 2.3 },
    { month: '10月', 收益: 4.2, 基准: 3.5 },
    { month: '11月', 收益: 3.1, 基准: 2.7 },
    { month: '12月', 收益: 3.9, 基准: 3.2 },
  ]

  // 统计信息
  const stats = {
    totalReturn: 35.0,
    benchmarkReturn: 28.0,
    volatility: 12.5,
    sharpeRatio: 1.8,
    maxDrawdown: 8.2,
  }

  // 处理饼图数据
  const pieChartData = allocationData.map(item => ({
    name: item.category,
    value: item.value,
    color: item.color,
  }))

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>数据分析</Title>
        <Text type="secondary">通过多种图表进行可视化分析，深入了解投资组合表现</Text>
      </div>

      {/* 控制面板 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>时间范围</Text>
              <Select value={timeRange} onChange={setTimeRange} style={{ width: '100%' }}>
                <Option value="1m">最近1个月</Option>
                <Option value="3m">最近3个月</Option>
                <Option value="6m">最近6个月</Option>
                <Option value="1y">最近1年</Option>
                <Option value="3y">最近3年</Option>
                <Option value="5y">最近5年</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>日期范围</Text>
              <RangePicker style={{ width: '100%' }} />
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space style={{ float: 'right' }}>
              <Button icon={<RefreshCw size={16} />}>刷新</Button>
              <Button icon={<DownloadOutlined />} type="primary">
                导出图表
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="总收益率"
              value={stats.totalReturn}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<TrendingUp size={16} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="基准收益率"
              value={stats.benchmarkReturn}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="波动率"
              value={stats.volatility}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="夏普比率"
              value={stats.sharpeRatio}
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="最大回撤"
              value={stats.maxDrawdown}
              suffix="%"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="超额收益"
              value={stats.totalReturn - stats.benchmarkReturn}
              suffix="%"
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Tabs defaultActiveKey="1" type="card">
        <TabPane
          tab={
            <span>
              <LineChartOutlined />
              趋势分析
            </span>
          }
          key="1"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="投资组合净值趋势">
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: '净值', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value}`, '净值']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="portfolio"
                        stroke="#1890ff"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        name="投资组合"
                      />
                      <Line
                        type="monotone"
                        dataKey="benchmark"
                        stroke="#52c41a"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="基准指数"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="月度收益对比">
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyReturnData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis label={{ value: '收益率 (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value}%`, '收益率']} />
                      <Legend />
                      <Bar dataKey="收益" fill="#1890ff" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="基准" fill="#52c41a" radius={[4, 4, 0, 0]} />
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
              <PieChartOutlined />
              资产分布
            </span>
          }
          key="2"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="大类资产配置">
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, '占比']} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="行业分布">
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
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
                      <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
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
              风险分析
            </span>
          }
          key="3"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card title="风险收益散点图">
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="risk"
                        name="风险"
                        label={{ value: '风险 (%)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis
                        type="number"
                        dataKey="return"
                        name="收益"
                        label={{ value: '收益 (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <ZAxis range={[100, 400]} />
                      <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                      <Legend />
                      <Scatter name="资产类别" data={riskReturnData} fill="#8884d8">
                        {riskReturnData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default ChartsAnalysisPage
