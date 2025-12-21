import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Typography, Space, Spin, Alert } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, LineChartOutlined, PieChartOutlined, SafetyOutlined } from '@ant-design/icons'
import { TrendingUp, Wallet, BarChart3 } from 'lucide-react'
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getPortfolioMetrics, getAssetAllocation } from '../services/dataService'
import { formatCurrency, formatPercent } from '../utils/formatters'
import type { PortfolioMetrics, AssetAllocation } from '../services/dataService'

const { Title, Text } = Typography

const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [allocation, setAllocation] = useState<AssetAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [metricsData, allocationData] = await Promise.all([
          getPortfolioMetrics(),
          getAssetAllocation(),
        ])
        setMetrics(metricsData)
        setAllocation(allocationData)
      } catch (err) {
        setError('加载数据失败，请稍后重试')
        console.error('数据加载错误:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />
  }

  const performanceData = [
    { month: '1月', 收益率: 2.5, 基准: 1.8 },
    { month: '2月', 收益率: 3.2, 基准: 2.1 },
    { month: '3月', 收益率: 1.8, 基准: 1.5 },
    { month: '4月', 收益率: 4.1, 基准: 3.2 },
    { month: '5月', 收益率: 2.9, 基准: 2.4 },
    { month: '6月', 收益率: 3.5, 基准: 2.8 },
  ]

  const recentActivities = [
    { time: '10:30', action: '买入', asset: 'AAPL', amount: '¥50,000', status: '成功' },
    { time: '昨天', action: '卖出', asset: 'GOOGL', amount: '¥32,500', status: '成功' },
    { time: '2天前', action: '调仓', asset: '投资组合', amount: '¥120,000', status: '进行中' },
    { time: '3天前', action: '买入', asset: 'TSLA', amount: '¥28,000', status: '成功' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>数据看板</Title>
        <Text type="secondary">实时监控您的投资组合表现和关键指标</Text>
      </div>

      {/* 关键指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总资产"
              value={metrics?.totalAssets || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ color: '#1890ff' }}
            />
            <Space style={{ marginTop: 8 }}>
              <Text type="secondary">较上月</Text>
              <Text type="success">
                <ArrowUpOutlined /> +2.3%
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="当日盈亏"
              value={metrics?.dailyPnL || 0}
              prefix={metrics?.dailyPnL && metrics.dailyPnL >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ color: metrics?.dailyPnL && metrics.dailyPnL >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
            <Space style={{ marginTop: 8 }}>
              <Text type="secondary">年化收益</Text>
              <Text type="success">
                {formatPercent(metrics?.avgReturn || 0)}
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="夏普比率"
              value={metrics?.sharpeRatio || 0}
              prefix={<LineChartOutlined />}
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
            <Space style={{ marginTop: 8 }}>
              <Text type="secondary">风险调整后收益</Text>
              <Text type={metrics?.sharpeRatio && metrics.sharpeRatio > 1 ? 'success' : 'warning'}>
                {metrics?.sharpeRatio && metrics.sharpeRatio > 1 ? '优秀' : '一般'}
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="最大回撤"
              value={metrics?.maxDrawdown || 0}
              prefix={<SafetyOutlined />}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Space style={{ marginTop: 8 }}>
              <Text type="secondary">风险控制</Text>
              <Text type={metrics?.maxDrawdown && metrics.maxDrawdown < 10 ? 'success' : 'danger'}>
                {metrics?.maxDrawdown && metrics.maxDrawdown < 10 ? '良好' : '需关注'}
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChart3 size={20} />
                <span>业绩趋势</span>
              </Space>
            }
            extra={<Text type="secondary">过去6个月</Text>}
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: '收益率 (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value}%`, '收益率']} />
                  <Legend />
                  <Line type="monotone" dataKey="收益率" stroke="#1890ff" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="基准" stroke="#52c41a" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PieChartOutlined />
                <span>资产分布</span>
              </Space>
            }
            extra={<Text type="secondary">当前配置</Text>}
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation.map(item => ({ name: item.category, value: item.value, color: item.color }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, '占比']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 底部卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Wallet size={20} />
                <span>近期活动</span>
              </Space>
            }
          >
            <div>
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < recentActivities.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{activity.action} {activity.asset}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{activity.time}</Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 500 }}>{activity.amount}</div>
                    <Text type={activity.status === '成功' ? 'success' : 'warning'} style={{ fontSize: 12 }}>
                      {activity.status}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TrendingUp size={20} />
                <span>市场快照</span>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="沪深300"
                    value={3856.42}
                    precision={2}
                    valueStyle={{ color: '#52c41a', fontSize: 20 }}
                    prefix={<ArrowUpOutlined />}
                    suffix="点"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>+1.2% 今日</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="标普500"
                    value={5123.18}
                    precision={2}
                    valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                    prefix={<ArrowDownOutlined />}
                    suffix="点"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>-0.8% 今日</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="黄金价格"
                    value={2356.80}
                    precision={2}
                    valueStyle={{ color: '#faad14', fontSize: 20 }}
                    prefix={<ArrowUpOutlined />}
                    suffix="美元/盎司"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>+0.5% 今日</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="美元指数"
                    value={104.32}
                    precision={2}
                    valueStyle={{ color: '#1890ff', fontSize: 20 }}
                    prefix={<ArrowUpOutlined />}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>+0.3% 今日</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
