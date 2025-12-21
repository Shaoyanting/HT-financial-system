import React, { useState, useEffect, useMemo } from 'react'
import { Row, Col, Card, Typography, Select, DatePicker, Space, Button, Radio, Statistic, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { TrendingUp, RefreshCw } from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  BarChart,
  Line,
  Area,
  AreaChart,
  LineChart,
} from 'recharts'
import { getBenchmarkData } from '../services/dataService'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const TrendAnalysisPage: React.FC = () => {
  // 初始状态
  const initialTimeRange = '1y'
  const initialChartType = 'line'
  const initialDateRange = null

  const [timeRange, setTimeRange] = useState(initialTimeRange)
  const [chartType, setChartType] = useState(initialChartType)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<[string, string] | null>(initialDateRange)

  // 根据筛选条件获取数据
  const fetchData = async (days: number) => {
    try {
      setLoading(true)
      await getBenchmarkData(days)
    } catch (error) {
      console.error('加载基准数据错误:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始化数据
  useEffect(() => {
    const daysMap: Record<string, number> = {
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365,
      '3y': 1095,
      '5y': 1825,
    }
    const days = daysMap[initialTimeRange] || 365
    fetchData(days)
  }, [])

  // 时间范围变化时重新获取数据
  useEffect(() => {
    const daysMap: Record<string, number> = {
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365,
      '3y': 1095,
      '5y': 1825,
    }
    const days = daysMap[timeRange] || 365
    fetchData(days)
  }, [timeRange])

  // 处理刷新 - 重置所有筛选条件并重新获取数据
  const handleRefresh = () => {
    setTimeRange(initialTimeRange)
    setChartType(initialChartType)
    setDateRange(initialDateRange)
    
    const daysMap: Record<string, number> = {
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365,
      '3y': 1095,
      '5y': 1825,
    }
    const days = daysMap[initialTimeRange] || 365
    fetchData(days)
    
    message.success('数据已刷新，筛选条件已重置')
  }

  // 根据时间范围生成投资组合净值数据
  const generatePortfolioData = (range: string) => {
    const dataMap: Record<string, Array<{date: string, portfolio: number, benchmark: number, volume: number}>> = {
      '1m': [
        { date: '12-01', portfolio: 130, benchmark: 125, volume: 2100000 },
        { date: '12-05', portfolio: 131, benchmark: 126, volume: 2150000 },
        { date: '12-10', portfolio: 132, benchmark: 127, volume: 2200000 },
        { date: '12-15', portfolio: 133, benchmark: 128, volume: 2250000 },
        { date: '12-20', portfolio: 134, benchmark: 129, volume: 2300000 },
        { date: '12-25', portfolio: 135, benchmark: 130, volume: 2350000 },
        { date: '12-30', portfolio: 136, benchmark: 131, volume: 2400000 },
      ],
      '3m': [
        { date: '10月', portfolio: 128, benchmark: 122, volume: 2020000 },
        { date: '11月', portfolio: 130, benchmark: 125, volume: 2100000 },
        { date: '12月', portfolio: 135, benchmark: 128, volume: 2200000 },
      ],
      '6m': [
        { date: '7月', portfolio: 120, benchmark: 115, volume: 1800000 },
        { date: '8月', portfolio: 122, benchmark: 118, volume: 1880000 },
        { date: '9月', portfolio: 125, benchmark: 120, volume: 1950000 },
        { date: '10月', portfolio: 128, benchmark: 122, volume: 2020000 },
        { date: '11月', portfolio: 130, benchmark: 125, volume: 2100000 },
        { date: '12月', portfolio: 135, benchmark: 128, volume: 2200000 },
      ],
      '1y': [
        { date: '2024-01', portfolio: 100, benchmark: 100, volume: 1200000 },
        { date: '2024-02', portfolio: 105, benchmark: 102, volume: 1350000 },
        { date: '2024-03', portfolio: 108, benchmark: 105, volume: 1420000 },
        { date: '2024-04', portfolio: 112, benchmark: 108, volume: 1580000 },
        { date: '2024-05', portfolio: 115, benchmark: 110, volume: 1650000 },
        { date: '2024-06', portfolio: 118, benchmark: 112, volume: 1720000 },
        { date: '2024-07', portfolio: 120, benchmark: 115, volume: 1800000 },
        { date: '2024-08', portfolio: 122, benchmark: 118, volume: 1880000 },
        { date: '2024-09', portfolio: 125, benchmark: 120, volume: 1950000 },
        { date: '2024-10', portfolio: 128, benchmark: 122, volume: 2020000 },
        { date: '2024-11', portfolio: 130, benchmark: 125, volume: 2100000 },
        { date: '2024-12', portfolio: 135, benchmark: 128, volume: 2200000 },
      ],
      '3y': [
        { date: '2022', portfolio: 85, benchmark: 80, volume: 1500000 },
        { date: '2023', portfolio: 95, benchmark: 90, volume: 1800000 },
        { date: '2024', portfolio: 135, benchmark: 128, volume: 2200000 },
      ],
      '5y': [
        { date: '2020', portfolio: 70, benchmark: 65, volume: 1000000 },
        { date: '2021', portfolio: 80, benchmark: 75, volume: 1200000 },
        { date: '2022', portfolio: 85, benchmark: 80, volume: 1500000 },
        { date: '2023', portfolio: 95, benchmark: 90, volume: 1800000 },
        { date: '2024', portfolio: 135, benchmark: 128, volume: 2200000 },
      ],
    }
    return dataMap[range] || dataMap['1y']
  }

  // 根据日期范围筛选数据
  const filterDataByDateRange = (data: Array<{date: string}>, dateRange: [string, string] | null) => {
    if (!dateRange) return data
    
    const [start, end] = dateRange
    return data.filter(item => {
      const itemDate = item.date
      return itemDate >= start && itemDate <= end
    })
  }

  // 获取筛选后的投资组合数据
  const portfolioData = useMemo(() => {
    const data = generatePortfolioData(timeRange)
    return filterDataByDateRange(data, dateRange)
  }, [timeRange, dateRange])

  // 根据时间范围生成月度收益数据
  const monthlyReturnData = useMemo(() => {
    const dataMap: Record<string, Array<{month: string, 收益: number, 基准: number, 超额: number}>> = {
      '1m': [
        { month: '第1周', 收益: 0.8, 基准: 0.5, 超额: 0.3 },
        { month: '第2周', 收益: 1.2, 基准: 0.8, 超额: 0.4 },
        { month: '第3周', 收益: 0.9, 基准: 0.6, 超额: 0.3 },
        { month: '第4周', 收益: 1.1, 基准: 0.7, 超额: 0.4 },
      ],
      '3m': [
        { month: '10月', 收益: 4.2, 基准: 3.5, 超额: 0.7 },
        { month: '11月', 收益: 3.1, 基准: 2.7, 超额: 0.4 },
        { month: '12月', 收益: 3.9, 基准: 3.2, 超额: 0.7 },
      ],
      '6m': [
        { month: '7月', 收益: 2.1, 基准: 1.9, 超额: 0.2 },
        { month: '8月', 收益: 3.8, 基准: 3.1, 超额: 0.7 },
        { month: '9月', 收益: 2.7, 基准: 2.3, 超额: 0.4 },
        { month: '10月', 收益: 4.2, 基准: 3.5, 超额: 0.7 },
        { month: '11月', 收益: 3.1, 基准: 2.7, 超额: 0.4 },
        { month: '12月', 收益: 3.9, 基准: 3.2, 超额: 0.7 },
      ],
      '1y': [
        { month: '1月', 收益: 2.5, 基准: 1.8, 超额: 0.7 },
        { month: '2月', 收益: 3.2, 基准: 2.1, 超额: 1.1 },
        { month: '3月', 收益: 1.8, 基准: 1.5, 超额: 0.3 },
        { month: '4月', 收益: 4.1, 基准: 3.2, 超额: 0.9 },
        { month: '5月', 收益: 2.9, 基准: 2.4, 超额: 0.5 },
        { month: '6月', 收益: 3.5, 基准: 2.8, 超额: 0.7 },
        { month: '7月', 收益: 2.1, 基准: 1.9, 超额: 0.2 },
        { month: '8月', 收益: 3.8, 基准: 3.1, 超额: 0.7 },
        { month: '9月', 收益: 2.7, 基准: 2.3, 超额: 0.4 },
        { month: '10月', 收益: 4.2, 基准: 3.5, 超额: 0.7 },
        { month: '11月', 收益: 3.1, 基准: 2.7, 超额: 0.4 },
        { month: '12月', 收益: 3.9, 基准: 3.2, 超额: 0.7 },
      ],
      '3y': [
        { month: '2022', 收益: 8.5, 基准: 6.2, 超额: 2.3 },
        { month: '2023', 收益: 12.3, 基准: 9.8, 超额: 2.5 },
        { month: '2024', 收益: 35.0, 基准: 28.0, 超额: 7.0 },
      ],
      '5y': [
        { month: '2020', 收益: -5.2, 基准: -8.1, 超额: 2.9 },
        { month: '2021', 收益: 15.8, 基准: 12.5, 超额: 3.3 },
        { month: '2022', 收益: 8.5, 基准: 6.2, 超额: 2.3 },
        { month: '2023', 收益: 12.3, 基准: 9.8, 超额: 2.5 },
        { month: '2024', 收益: 35.0, 基准: 28.0, 超额: 7.0 },
      ],
    }
    return dataMap[timeRange] || dataMap['1y']
  }, [timeRange])

  // 统计信息
  const stats = {
    totalReturn: 35.0,
    benchmarkReturn: 28.0,
    alpha: 7.0,
    beta: 0.95,
    sharpeRatio: 1.8,
    informationRatio: 0.9,
  }

  // 根据图表类型渲染不同的图表
  const renderMainChart = () => {
    const data = portfolioData
    
    if (chartType === 'area') {
      return (
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" label={{ value: '净值', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: '成交量', angle: 90, position: 'insideRight' }} />
          <Tooltip formatter={(value, name) => {
            if (name === 'volume') return [`${(value as number).toLocaleString()}`, '成交量']
            return [`${value}`, name]
          }} />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="portfolio"
            stroke="#1890ff"
            fill="#1890ff"
            fillOpacity={0.3}
            strokeWidth={3}
            name="投资组合"
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="benchmark"
            stroke="#52c41a"
            fill="#52c41a"
            fillOpacity={0.3}
            strokeWidth={2}
            name="基准指数"
          />
        </AreaChart>
      )
    } else if (chartType === 'composed') {
      return (
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" label={{ value: '净值', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: '成交量', angle: 90, position: 'insideRight' }} />
          <Tooltip formatter={(value, name) => {
            if (name === 'volume') return [`${(value as number).toLocaleString()}`, '成交量']
            return [`${value}`, name]
          }} />
          <Legend />
          <Bar yAxisId="right" dataKey="volume" fill="#8884d8" radius={[4, 4, 0, 0]} name="成交量" />
          <Line yAxisId="left" type="monotone" dataKey="portfolio" stroke="#1890ff" strokeWidth={3} name="投资组合" />
          <Line yAxisId="left" type="monotone" dataKey="benchmark" stroke="#52c41a" strokeWidth={2} name="基准指数" />
        </ComposedChart>
      )
    } else {
      // 默认折线图
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" label={{ value: '净值', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: '成交量', angle: 90, position: 'insideRight' }} />
          <Tooltip formatter={(value, name) => {
            if (name === 'volume') return [`${(value as number).toLocaleString()}`, '成交量']
            return [`${value}`, name]
          }} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="portfolio" stroke="#1890ff" strokeWidth={3} name="投资组合" />
          <Line yAxisId="left" type="monotone" dataKey="benchmark" stroke="#52c41a" strokeWidth={2} name="基准指数" />
        </LineChart>
      )
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>趋势分析</Title>
        <Text type="secondary">分析投资组合与市场基准的历史趋势和未来走势预测</Text>
      </div>

      {/* 控制面板 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
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
          <Col xs={24} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>日期范围</Text>
              <RangePicker
                style={{ width: '100%' }}
                onChange={(_, dateStrings) => setDateRange(dateStrings as [string, string])}
              />
            </Space>
          </Col>
          <Col xs={24} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>图表类型</Text>
              <Radio.Group value={chartType} onChange={(e) => setChartType(e.target.value)}>
                <Radio.Button value="line">折线图</Radio.Button>
                <Radio.Button value="area">面积图</Radio.Button>
                <Radio.Button value="composed">组合图</Radio.Button>
              </Radio.Group>
            </Space>
          </Col>
          <Col xs={24} md={6}>
            <Space style={{ float: 'right' }}>
              <Button icon={<RefreshCw size={16} />} onClick={handleRefresh}>刷新</Button>
              <Button icon={<DownloadOutlined />} type="primary">
                导出
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
              title="Alpha"
              value={stats.alpha}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Beta"
              value={stats.beta}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="夏普比率"
              value={stats.sharpeRatio}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="信息比率"
              value={stats.informationRatio}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主图表 */}
      <Card
        title="投资组合与基准指数对比"
        loading={loading}
        style={{ marginBottom: 24 }}
      >
        <ResponsiveContainer width="100%" height={400}>
          {renderMainChart()}
        </ResponsiveContainer>
      </Card>

      {/* 月度收益图表 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="月度收益对比">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyReturnData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: '收益率(%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value}%`, '收益率']} />
                <Legend />
                <Bar dataKey="收益" fill="#1890ff" radius={[4, 4, 0, 0]} name="投资组合收益" />
                <Bar dataKey="基准" fill="#52c41a" radius={[4, 4, 0, 0]} name="基准收益" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="超额收益">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyReturnData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: '超额收益(%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value}%`, '超额收益']} />
                <Legend />
                <Bar dataKey="超额" fill="#faad14" radius={[4, 4, 0, 0]} name="超额收益" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default TrendAnalysisPage
