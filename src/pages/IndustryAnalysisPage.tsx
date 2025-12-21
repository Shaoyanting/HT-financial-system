import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Select, Space, Button, Radio, Statistic, Table, Tag, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { TrendingUp, RefreshCw, Building } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts'
import { getIndustryDistribution } from '../services/dataService'
import { formatPercent, formatCurrency } from '../utils/formatters'
import type { IndustryDistribution } from '../services/dataService'

const { Title, Text } = Typography
const { Option } = Select

const IndustryAnalysisPage: React.FC = () => {
  // 初始状态
  const initialViewType = 'bar'
  const initialTimeRange = '1y'
  const initialSortBy = 'return'
  const initialIndustryFilter = 'all'

  const [industryData, setIndustryData] = useState<IndustryDistribution[]>([])
  const [viewType, setViewType] = useState(initialViewType)
  const [timeRange, setTimeRange] = useState(initialTimeRange)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [industryFilter, setIndustryFilter] = useState(initialIndustryFilter)

  // 根据筛选条件获取数据
  const fetchData = async (range: string, filter: string) => {
    try {
      const data = await getIndustryDistribution()
      
      // 根据时间范围筛选数据（这里模拟不同时间范围的数据）
      let filteredData = data
      if (range === '1m') {
        // 最近1个月：模拟短期数据变化
        filteredData = data.map(item => ({
          ...item,
          value: item.value * (0.95 + Math.random() * 0.1) // 小幅变化
        }))
      } else if (range === '3m') {
        // 最近3个月
        filteredData = data.map(item => ({
          ...item,
          value: item.value * (0.9 + Math.random() * 0.2)
        }))
      } else if (range === '6m') {
        // 最近6个月
        filteredData = data.map(item => ({
          ...item,
          value: item.value * (0.85 + Math.random() * 0.3)
        }))
      } else if (range === '3y') {
        // 最近3年
        filteredData = data.map(item => ({
          ...item,
          value: item.value * (0.7 + Math.random() * 0.6)
        }))
      }
      
      // 根据行业筛选数据
      if (filter !== 'all') {
        const filterMap: Record<string, string> = {
          'tech': '科技',
          'finance': '金融',
          'consumer': '消费',
          'healthcare': '医疗',
          'industrial': '工业'
        }
        const industryName = filterMap[filter]
        if (industryName) {
          filteredData = filteredData.filter(item => 
            item.industry.includes(industryName)
          )
        }
      }
      
      setIndustryData(filteredData)
    } catch (error) {
      console.error('加载行业数据错误:', error)
    }
  }

  // 初始化数据
  useEffect(() => {
    fetchData(initialTimeRange, initialIndustryFilter)
  }, [])

  // 时间范围变化时重新获取数据
  useEffect(() => {
    fetchData(timeRange, industryFilter)
  }, [timeRange])

  // 行业筛选变化时重新获取数据
  useEffect(() => {
    fetchData(timeRange, industryFilter)
  }, [industryFilter])

  // 处理刷新 - 重置所有筛选条件并重新获取数据
  const handleRefresh = () => {
    setViewType(initialViewType)
    setTimeRange(initialTimeRange)
    setSortBy(initialSortBy)
    setIndustryFilter(initialIndustryFilter)
    
    fetchData(initialTimeRange, initialIndustryFilter)
    
    message.success('数据已刷新，筛选条件已重置')
  }

  // 模拟行业历史数据
  const historicalIndustryData = [
    { date: '2024-01', 科技: 30.5, 金融: 20.2, 消费: 15.8, 医疗: 12.5, 工业: 10.3 },
    { date: '2024-02', 科技: 31.2, 金融: 19.8, 消费: 16.1, 医疗: 12.3, 工业: 10.1 },
    { date: '2024-03', 科技: 32.1, 金融: 19.5, 消费: 16.3, 医疗: 12.1, 工业: 9.8 },
    { date: '2024-04', 科技: 32.8, 金融: 19.2, 消费: 16.5, 医疗: 11.9, 工业: 9.5 },
    { date: '2024-05', 科技: 33.5, 金融: 18.9, 消费: 16.7, 医疗: 11.7, 工业: 9.3 },
    { date: '2024-06', 科技: 33.8, 金融: 18.5, 消费: 16.9, 医疗: 11.5, 工业: 9.1 },
    { date: '2024-07', 科技: 34.2, 金融: 18.2, 消费: 17.1, 医疗: 11.3, 工业: 8.9 },
    { date: '2024-08', 科技: 34.5, 金融: 17.9, 消费: 17.3, 医疗: 11.1, 工业: 8.7 },
    { date: '2024-09', 科技: 34.8, 金融: 17.6, 消费: 17.5, 医疗: 10.9, 工业: 8.5 },
    { date: '2024-10', 科技: 35.1, 金融: 17.3, 消费: 17.7, 医疗: 10.7, 工业: 8.3 },
    { date: '2024-11', 科技: 35.4, 金融: 17.0, 消费: 17.9, 医疗: 10.5, 工业: 8.1 },
    { date: '2024-12', 科技: 35.8, 金融: 16.8, 消费: 18.1, 医疗: 10.3, 工业: 7.9 },
  ]

  // 根据筛选条件生成行业收益数据
  const generateIndustryReturnData = () => {
    const baseData = [
      { industry: '科技', return: 42.5, volatility: 25.3, sharpe: 1.68, marketCap: 85000000 },
      { industry: '金融', return: 18.2, volatility: 15.8, sharpe: 1.15, marketCap: 45000000 },
      { industry: '消费', return: 25.7, volatility: 18.2, sharpe: 1.41, marketCap: 32000000 },
      { industry: '医疗', return: 15.3, volatility: 12.5, sharpe: 1.22, marketCap: 28000000 },
      { industry: '工业', return: 12.8, volatility: 14.2, sharpe: 0.90, marketCap: 22000000 },
      { industry: '能源', return: 8.5, volatility: 20.1, sharpe: 0.42, marketCap: 18000000 },
      { industry: '房地产', return: 5.2, volatility: 22.5, sharpe: 0.23, marketCap: 15000000 },
      { industry: '材料', return: 10.3, volatility: 16.8, sharpe: 0.61, marketCap: 12000000 },
    ]
    
    // 根据行业筛选过滤数据
    let filteredData = baseData
    if (industryFilter !== 'all') {
      const filterMap: Record<string, string> = {
        'tech': '科技',
        'finance': '金融',
        'consumer': '消费',
        'healthcare': '医疗',
        'industrial': '工业'
      }
      const industryName = filterMap[industryFilter]
      if (industryName) {
        filteredData = baseData.filter(item => 
          item.industry.includes(industryName)
        )
      }
    }
    
    // 根据时间范围调整数据（模拟不同时间范围的数据变化）
    if (timeRange === '1m') {
      filteredData = filteredData.map(item => ({
        ...item,
        return: item.return * (0.95 + Math.random() * 0.1),
        volatility: item.volatility * (0.95 + Math.random() * 0.1),
        sharpe: item.sharpe * (0.95 + Math.random() * 0.1),
      }))
    } else if (timeRange === '3m') {
      filteredData = filteredData.map(item => ({
        ...item,
        return: item.return * (0.9 + Math.random() * 0.2),
        volatility: item.volatility * (0.9 + Math.random() * 0.2),
        sharpe: item.sharpe * (0.9 + Math.random() * 0.2),
      }))
    } else if (timeRange === '6m') {
      filteredData = filteredData.map(item => ({
        ...item,
        return: item.return * (0.85 + Math.random() * 0.3),
        volatility: item.volatility * (0.85 + Math.random() * 0.3),
        sharpe: item.sharpe * (0.85 + Math.random() * 0.3),
      }))
    } else if (timeRange === '3y') {
      filteredData = filteredData.map(item => ({
        ...item,
        return: item.return * (0.7 + Math.random() * 0.6),
        volatility: item.volatility * (0.7 + Math.random() * 0.6),
        sharpe: item.sharpe * (0.7 + Math.random() * 0.6),
      }))
    }
    
    // 根据排序方式排序数据
    const sortedData = [...filteredData]
    if (sortBy === 'return') {
      sortedData.sort((a, b) => b.return - a.return)
    } else if (sortBy === 'volatility') {
      sortedData.sort((a, b) => b.volatility - a.volatility)
    } else if (sortBy === 'sharpe') {
      sortedData.sort((a, b) => b.sharpe - a.sharpe)
    } else if (sortBy === 'marketCap') {
      sortedData.sort((a, b) => b.marketCap - a.marketCap)
    }
    
    return sortedData
  }

  // 获取动态生成的行业收益数据
  const industryReturnData = generateIndustryReturnData()

  // 模拟行业相关性矩阵
  const correlationData = [
    { industry: '科技', 科技: 1.00, 金融: 0.35, 消费: 0.42, 医疗: 0.38, 工业: 0.31 },
    { industry: '金融', 科技: 0.35, 金融: 1.00, 消费: 0.28, 医疗: 0.25, 工业: 0.32 },
    { industry: '消费', 科技: 0.42, 金融: 0.28, 消费: 1.00, 医疗: 0.45, 工业: 0.38 },
    { industry: '医疗', 科技: 0.38, 金融: 0.25, 消费: 0.45, 医疗: 1.00, 工业: 0.29 },
    { industry: '工业', 科技: 0.31, 金融: 0.32, 消费: 0.38, 医疗: 0.29, 工业: 1.00 },
  ]

  // 统计信息
  const stats = {
    totalIndustries: industryData.length,
    topIndustry: '科技',
    topIndustryPercentage: 35.8,
    avgReturn: 17.4,
    avgVolatility: 18.1,
    concentrationIndex: 0.42,
    diversificationScore: 7.8,
  }

  // 表格列定义
  interface IndustryReturnData {
    industry: string
    return: number
    volatility: number
    sharpe: number
    marketCap: number
  }

  const columns = [
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      render: (text: string) => (
        <Space>
          <Building size={16} />
          {text}
        </Space>
      ),
    },
    {
      title: '收益率',
      dataIndex: 'return',
      key: 'return',
      render: (value: number) => (
        <Text type={value >= 0 ? 'success' : 'danger'}>
          {value > 0 ? '+' : ''}{formatPercent(value / 100, 1)}
        </Text>
      ),
      sorter: (a: IndustryReturnData, b: IndustryReturnData) => a.return - b.return,
    },
    {
      title: '波动率',
      dataIndex: 'volatility',
      key: 'volatility',
      render: (value: number) => formatPercent(value / 100, 1),
      sorter: (a: IndustryReturnData, b: IndustryReturnData) => a.volatility - b.volatility,
    },
    {
      title: '夏普比率',
      dataIndex: 'sharpe',
      key: 'sharpe',
      render: (value: number) => value.toFixed(2),
      sorter: (a: IndustryReturnData, b: IndustryReturnData) => a.sharpe - b.sharpe,
    },
    {
      title: '市值',
      dataIndex: 'marketCap',
      key: 'marketCap',
      render: (value: number) => formatCurrency(value),
      sorter: (a: IndustryReturnData, b: IndustryReturnData) => a.marketCap - b.marketCap,
    },
    {
      title: '评级',
      key: 'rating',
      render: (_: unknown, record: IndustryReturnData) => {
        if (record.sharpe > 1.5) return <Tag color="green">优秀</Tag>
        if (record.sharpe > 1.0) return <Tag color="blue">良好</Tag>
        if (record.sharpe > 0.5) return <Tag color="orange">一般</Tag>
        return <Tag color="red">较差</Tag>
      },
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>行业分析</Title>
        <Text type="secondary">深入分析各行业的投资价值、风险特征和相关性</Text>
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
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>视图类型</Text>
              <Radio.Group value={viewType} onChange={(e) => setViewType(e.target.value)}>
                <Radio.Button value="bar">柱状图</Radio.Button>
                <Radio.Button value="line">折线图</Radio.Button>
                <Radio.Button value="composed">组合图</Radio.Button>
              </Radio.Group>
            </Space>
          </Col>
          <Col xs={24} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>排序方式</Text>
              <Select 
                value={sortBy} 
                onChange={setSortBy}
                style={{ width: '100%' }}
              >
                <Option value="return">收益率</Option>
                <Option value="volatility">波动率</Option>
                <Option value="sharpe">夏普比率</Option>
                <Option value="marketCap">市值</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>行业筛选</Text>
              <Select 
                value={industryFilter} 
                onChange={setIndustryFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">所有行业</Option>
                <Option value="tech">科技</Option>
                <Option value="finance">金融</Option>
                <Option value="consumer">消费</Option>
                <Option value="healthcare">医疗</Option>
                <Option value="industrial">工业</Option>
              </Select>
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
              title="行业数量"
              value={stats.totalIndustries}
              valueStyle={{ color: '#1890ff' }}
              prefix={<Building size={16} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="最大行业"
              value={stats.topIndustry}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="最大行业占比"
              value={stats.topIndustryPercentage}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="平均收益率"
              value={stats.avgReturn}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
              prefix={<TrendingUp size={16} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="平均波动率"
              value={stats.avgVolatility}
              suffix="%"
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
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="行业分布与收益">
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                {viewType === 'bar' ? (
                  <BarChart data={industryReturnData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="industry" />
                    <YAxis yAxisId="left" label={{ value: '收益率 (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: '波动率 (%)', angle: 90, position: 'insideRight' }} />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'return' || name === 'volatility') return [`${value}%`, name]
                      return [value, name]
                    }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="return" fill="#1890ff" radius={[4, 4, 0, 0]} name="收益率" />
                    <Bar yAxisId="right" dataKey="volatility" fill="#faad14" radius={[4, 4, 0, 0]} name="波动率" />
                  </BarChart>
                ) : viewType === 'line' ? (
                  <LineChart data={historicalIndustryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: '占比 (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value}%`, '占比']} />
                    <Legend />
                    <Line type="monotone" dataKey="科技" stroke="#1890ff" strokeWidth={2} />
                    <Line type="monotone" dataKey="金融" stroke="#52c41a" strokeWidth={2} />
                    <Line type="monotone" dataKey="消费" stroke="#faad14" strokeWidth={2} />
                    <Line type="monotone" dataKey="医疗" stroke="#f5222d" strokeWidth={2} />
                    <Line type="monotone" dataKey="工业" stroke="#722ed1" strokeWidth={2} />
                  </LineChart>
                ) : (
                  <ComposedChart data={industryReturnData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="industry" />
                    <YAxis yAxisId="left" label={{ value: '收益率 (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: '夏普比率', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="return" fill="#1890ff" radius={[4, 4, 0, 0]} name="收益率" />
                    <Line yAxisId="right" type="monotone" dataKey="sharpe" stroke="#f5222d" strokeWidth={2} name="夏普比率" />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="行业相关性矩阵">
            <div style={{ height: 400, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', textAlign: 'left', backgroundColor: '#fafafa' }}>行业</th>
                    {correlationData[0] && Object.keys(correlationData[0]).filter(key => key !== 'industry').map(key => (
                      <th key={key} style={{ padding: '8px', textAlign: 'center', backgroundColor: '#fafafa' }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationData.map((row, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{row.industry}</td>
                      {Object.keys(row).filter(key => key !== 'industry').map(key => (
                        <td key={key} style={{ padding: '8px', textAlign: 'center' }}>
                          <div style={{
                            backgroundColor: `rgba(24, 144, 255, ${row[key as keyof typeof row] as number})`,
                            color: (row[key as keyof typeof row] as number) > 0.5 ? '#fff' : '#000',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}>
                            {(row[key as keyof typeof row] as number).toFixed(2)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 行业数据表格 */}
      <Card title="行业详细数据" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={industryReturnData}
          rowKey="industry"
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* 分析报告 */}
      <Card title="行业分析报告">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div>
              <Title level={4}>投资机会</Title>
              <ul>
                <li>科技行业表现突出，收益率和夏普比率均领先</li>
                <li>消费行业增长稳定，与科技行业相关性适中</li>
                <li>医疗行业防御性强，适合作为风险对冲工具</li>
                <li>金融行业估值合理，提供稳定的股息收益</li>
              </ul>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div>
              <Title level={4}>风险提示</Title>
              <ul>
                <li>科技行业波动率较高，需关注估值风险</li>
                <li>房地产和能源行业表现疲软，建议谨慎配置</li>
                <li>行业集中度偏高，建议增加分散化程度</li>
                <li>关注宏观经济周期对各行业的影响</li>
              </ul>
            </div>
          </Col>
        </Row>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Space>
            <Button type="primary">生成行业配置建议</Button>
            <Button>模拟行业轮动</Button>
            <Button>分享分析报告</Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default IndustryAnalysisPage
