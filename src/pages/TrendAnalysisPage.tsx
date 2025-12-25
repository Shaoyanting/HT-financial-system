import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, DatePicker, Space, Button, Statistic, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { TrendingUp, RefreshCw } from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { downloadChart } from '../utils/chartDownload'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

// 模拟投资组合趋势数据 - 扩展到2026年6月
const mockPortfolioData = [
  { date: '2024-01', portfolio: 100.0, benchmark: 100.0, volume: 1200000 },
  { date: '2024-02', portfolio: 105.2, benchmark: 102.1, volume: 1350000 },
  { date: '2024-03', portfolio: 108.5, benchmark: 105.3, volume: 1500000 },
  { date: '2024-04', portfolio: 112.8, benchmark: 108.7, volume: 1650000 },
  { date: '2024-05', portfolio: 115.3, benchmark: 110.2, volume: 1800000 },
  { date: '2024-06', portfolio: 118.7, benchmark: 112.5, volume: 1950000 },
  { date: '2024-07', portfolio: 122.4, benchmark: 115.8, volume: 2100000 },
  { date: '2024-08', portfolio: 125.9, benchmark: 118.3, volume: 2250000 },
  { date: '2024-09', portfolio: 128.6, benchmark: 120.7, volume: 2400000 },
  { date: '2024-10', portfolio: 132.2, benchmark: 123.4, volume: 2550000 },
  { date: '2024-11', portfolio: 135.8, benchmark: 125.9, volume: 2700000 },
  { date: '2024-12', portfolio: 138.5, benchmark: 128.3, volume: 2850000 },
  { date: '2025-01', portfolio: 142.1, benchmark: 131.2, volume: 3000000 },
  { date: '2025-02', portfolio: 145.8, benchmark: 134.5, volume: 3150000 },
  { date: '2025-03', portfolio: 148.3, benchmark: 137.8, volume: 3300000 },
  { date: '2025-04', portfolio: 152.7, benchmark: 141.2, volume: 3450000 },
  { date: '2025-05', portfolio: 156.2, benchmark: 144.5, volume: 3600000 },
  { date: '2025-06', portfolio: 159.8, benchmark: 147.9, volume: 3750000 },
  { date: '2025-07', portfolio: 163.5, benchmark: 151.2, volume: 3900000 },
  { date: '2025-08', portfolio: 167.2, benchmark: 154.5, volume: 4050000 },
  { date: '2025-09', portfolio: 170.8, benchmark: 157.8, volume: 4200000 },
  { date: '2025-10', portfolio: 174.5, benchmark: 161.1, volume: 4350000 },
  { date: '2025-11', portfolio: 178.2, benchmark: 164.4, volume: 4500000 },
  { date: '2025-12', portfolio: 181.9, benchmark: 167.7, volume: 4650000 },
  { date: '2026-01', portfolio: 185.6, benchmark: 171.0, volume: 4800000 },
  { date: '2026-02', portfolio: 189.3, benchmark: 174.3, volume: 4950000 },
  { date: '2026-03', portfolio: 193.0, benchmark: 177.6, volume: 5100000 },
  { date: '2026-04', portfolio: 196.7, benchmark: 180.9, volume: 5250000 },
  { date: '2026-05', portfolio: 200.4, benchmark: 184.2, volume: 5400000 },
  { date: '2026-06', portfolio: 204.1, benchmark: 187.5, volume: 5550000 },
]

// 模拟月度收益数据
const mockMonthlyReturnData = [
  { month: '1月', 收益: 2.5, 基准: 1.8, 超额: 0.7 },
  { month: '2月', 收益: 3.2, 基准: 2.1, 超额: 1.1 },
  { month: '3月', 收益: 2.8, 基准: 2.0, 超额: 0.8 },
  { month: '4月', 收益: 3.5, 基准: 2.5, 超额: 1.0 },
  { month: '5月', 收益: 2.9, 基准: 2.2, 超额: 0.7 },
  { month: '6月', 收益: 3.8, 基准: 2.8, 超额: 1.0 },
  { month: '7月', 收益: 4.2, 基准: 3.0, 超额: 1.2 },
  { month: '8月', 收益: 3.5, 基准: 2.6, 超额: 0.9 },
  { month: '9月', 收益: 3.9, 基准: 2.9, 超额: 1.0 },
  { month: '10月', 收益: 4.5, 基准: 3.2, 超额: 1.3 },
  { month: '11月', 收益: 3.7, 基准: 2.7, 超额: 1.0 },
  { month: '12月', 收益: 4.8, 基准: 3.5, 超额: 1.3 },
]

const TrendAnalysisPage: React.FC = () => {
  // 初始状态
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(() => {
    // 默认显示最近两年
    const end = dayjs()
    const start = end.subtract(2, 'year')
    return [start, end]
  })
  const [loading, setLoading] = useState(false)
  const [portfolioData, setPortfolioData] = useState<Array<{
    date: string
    portfolio: number
    benchmark: number
    volume: number
  }>>(mockPortfolioData)
  const [monthlyReturnData, setMonthlyReturnData] = useState<Array<{
    month: string
    收益: number
    基准: number
    超额: number
  }>>(mockMonthlyReturnData)

  // 处理刷新 - 重置所有筛选条件
  const handleRefresh = () => {
    const end = dayjs()
    const start = end.subtract(1, 'year')
    setDateRange([start, end])
    message.success('数据已刷新，筛选条件已重置')
  }

  // 根据日期范围获取数据
  const fetchDataByDateRange = async (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
    try {
      setLoading(true)
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 计算时间范围的天数差
      const daysDiff = endDate.diff(startDate, 'day')
      
      // 根据时间范围筛选数据
      const startYear = startDate.year()
      const endYear = endDate.year()
      const startMonth = startDate.month() + 1
      const endMonth = endDate.month() + 1
      
      console.log('筛选数据，时间范围:', { startYear, endYear, startMonth, endMonth, daysDiff })
      
      // 筛选投资组合数据 - 基于实际日期范围
      const filteredPortfolioData = mockPortfolioData.filter(item => {
        const itemDate = item.date
        const startDateStr = `${startYear}-${startMonth.toString().padStart(2, '0')}`
        const endDateStr = `${endYear}-${endMonth.toString().padStart(2, '0')}`
        
        // 简单的字符串比较，因为日期格式是 YYYY-MM
        return itemDate >= startDateStr && itemDate <= endDateStr
      })
      
      // 筛选月度收益数据 - 基于月份索引
      // 首先确定要显示哪些月份
      let filteredMonthlyData = mockMonthlyReturnData
      
      // 如果时间范围小于等于3个月，显示对应的月份
      if (daysDiff <= 90) {
        // 计算要显示的月份数量（最多3个月）
        const monthsToShow = Math.min(3, Math.ceil(daysDiff / 30))
        filteredMonthlyData = mockMonthlyReturnData.slice(-monthsToShow)
      } 
      // 如果时间范围在3-6个月之间，显示最近6个月
      else if (daysDiff <= 180) {
        filteredMonthlyData = mockMonthlyReturnData.slice(-6)
      }
      // 如果时间范围大于6个月，显示所有月份
      else {
        filteredMonthlyData = mockMonthlyReturnData
      }
      
      console.log('筛选后的投资组合数据:', filteredPortfolioData.length, filteredPortfolioData)
      console.log('筛选后的月度收益数据:', filteredMonthlyData.length)
      
      // 如果筛选结果为空，显示默认数据
      if (filteredPortfolioData.length === 0) {
        // 根据时间范围显示相应数量的数据
        if (daysDiff <= 90) {
          setPortfolioData(mockPortfolioData.slice(-3))
        } else if (daysDiff <= 180) {
          setPortfolioData(mockPortfolioData.slice(-6))
        } else if (daysDiff <= 365) {
          setPortfolioData(mockPortfolioData.slice(-12))
        } else {
          setPortfolioData(mockPortfolioData)
        }
      } else {
        setPortfolioData(filteredPortfolioData)
      }
      
      setMonthlyReturnData(filteredMonthlyData)
      
    } catch (error) {
      console.error('加载数据错误:', error)
      message.error('数据加载失败，请稍后重试')
      // 出错时显示默认数据
      setPortfolioData(mockPortfolioData.slice(-12))
      setMonthlyReturnData(mockMonthlyReturnData)
    } finally {
      setLoading(false)
    }
  }

  // 日期范围变化时重新获取数据
  useEffect(() => {
    if (dateRange) {
      const [start, end] = dateRange
      fetchDataByDateRange(start, end)
    }
  }, [dateRange])

  // 处理导出 - 下载所有卡片为一张图片
  const handleExportAll = async () => {
    try {
      message.loading({ content: '正在生成截图...', key: 'export', duration: 0 })
      
      // 动态导入html2canvas
      const html2canvas = (await import('html2canvas')).default
      
      // 获取包含所有卡片的DOM元素
      const element = document.querySelector('.trend-analysis-cards')
      
      if (!element) {
        message.error({ content: '未找到要导出的内容', key: 'export' })
        return
      }
      
      // 设置截图选项
      const options = {
        scale: 2, // 提高分辨率
        useCORS: true, // 允许跨域图片
        allowTaint: true, // 允许污染画布
        backgroundColor: '#ffffff', // 白色背景
        logging: false, // 关闭日志
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      }
      
      // 生成截图
      const canvas = await html2canvas(element as HTMLElement, options)
      
      // 将canvas转换为图片URL
      const imageUrl = canvas.toDataURL('image/png', 1.0)
      
      // 创建下载链接
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `趋势分析报告_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.png`
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      message.success({ content: '导出成功！', key: 'export' })
      
    } catch (error) {
      console.error('导出失败:', error)
      message.error({ content: '导出失败，请重试', key: 'export' })
    }
  }

  // 渲染面积图
  const renderMainChart = () => {
    const data = portfolioData
    
    return (
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" label={{ value: '净值', angle: -90, position: 'insideLeft' }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: '成交量', angle: 90, position: 'insideRight' }} />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'volume') return [`${(value as number).toLocaleString()}`, '成交量']
            return [`${value}`, name]
          }}
          labelFormatter={(label) => `日期: ${label}`}
        />
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
          dot={{ strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
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
          dot={{ strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    )
  }

  // 处理图表下载
  const handleDownloadChart = (chartId: string, fileName: string) => {
    downloadChart(chartId, fileName)
  }

  // 生成超额收益饼图数据
  const excessReturnPieData = React.useMemo(() => {
    const data = monthlyReturnData
    
    // 定义颜色数组
    const colors = [
      '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2',
      '#eb2f96', '#fa8c16', '#a0d911', '#d4380d', '#08979c', '#7cb305',
      '#d46b08', '#389e0d', '#096dd9', '#c41d7f', '#531dab', '#d48806'
    ]
    
    // 处理数据：使用绝对值，并添加颜色
    const processedData = data.map((item, index) => ({
      name: item.month,
      value: Math.abs(item.超额), // 使用绝对值
      color: colors[index % colors.length], // 循环使用颜色数组
      originalValue: item.超额 // 保留原始值用于排序
    }))
    
    // 按值从小到大排序
    return processedData.sort((a, b) => a.value - b.value)
  }, [monthlyReturnData])

  // 计算统计指标
  const stats = React.useMemo(() => {
    if (portfolioData.length === 0 || monthlyReturnData.length === 0) {
      return {
        totalReturn: 35.0,
        benchmarkReturn: 28.0,
        alpha: 7.0,
        beta: 0.95,
        sharpeRatio: 1.8,
        informationRatio: 0.9,
      }
    }

    // 计算总收益率
    const firstPortfolio = portfolioData[0]?.portfolio || 100
    const lastPortfolio = portfolioData[portfolioData.length - 1]?.portfolio || 100
    const totalReturn = ((lastPortfolio - firstPortfolio) / firstPortfolio) * 100

    // 计算基准收益率
    const firstBenchmark = portfolioData[0]?.benchmark || 100
    const lastBenchmark = portfolioData[portfolioData.length - 1]?.benchmark || 100
    const benchmarkReturn = ((lastBenchmark - firstBenchmark) / firstBenchmark) * 100

    // 计算Alpha
    const alpha = totalReturn - benchmarkReturn

    // 计算平均超额收益
    const avgExcessReturn = monthlyReturnData.reduce((sum, item) => sum + item.超额, 0) / monthlyReturnData.length

    return {
      totalReturn: parseFloat(totalReturn.toFixed(1)),
      benchmarkReturn: parseFloat(benchmarkReturn.toFixed(1)),
      alpha: parseFloat(alpha.toFixed(1)),
      beta: 0.95, // 简化计算
      sharpeRatio: 1.8, // 简化计算
      informationRatio: avgExcessReturn > 0 ? 0.9 : 0.5, // 简化计算
    }
  }, [portfolioData, monthlyReturnData])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>趋势分析</Title>
        <Text type="secondary">分析投资组合与市场基准的历史趋势和未来走势预测</Text>
      </div>

      {/* 控制面板 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={6} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>时间范围</Text>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                format="YYYY-MM-DD"
                presets={[
                  { label: '最近3个月', value: [dayjs().subtract(3, 'month'), dayjs()] },
                  { label: '最近6个月', value: [dayjs().subtract(6, 'month'), dayjs()] },
                  { label: '最近12个月', value: [dayjs().subtract(12, 'month'), dayjs()] },
                  { label: '最近2年', value: [dayjs().subtract(2, 'year'), dayjs()] },
                ]}
              />
            </Space>
          </Col>
          <Col xs={18} md={18}>
            <Space style={{ float: 'right' }}>
              <Button icon={<RefreshCw size={16} />} onClick={handleRefresh}>刷新</Button>
              <Button icon={<DownloadOutlined />} type="primary" onClick={handleExportAll}>
                导出
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 卡片容器 - 用于导出功能 */}
      <div className="trend-analysis-cards">
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
          extra={
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={() => handleDownloadChart('main-portfolio-chart', '投资组合与基准指数对比')}
            >
              
            </Button>
          }
        >
          <div id="main-portfolio-chart">
            <ResponsiveContainer width="100%" height={400}>
              {renderMainChart()}
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 月度收益图表 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card 
              title="月度收益对比"
              loading={loading}
              extra={
                <Button 
                  type="text" 
                  icon={<DownloadOutlined />} 
                  onClick={() => handleDownloadChart('monthly-return-chart', '月度收益对比')}
                >
                  
                </Button>
              }
            >
              <div id="monthly-return-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyReturnData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: '收益率(%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: number | undefined) => [`${value || 0}%`, '收益率']} />
                    <Legend />
                    <Bar dataKey="收益" fill="#1890ff" radius={[4, 4, 0, 0]} name="投资组合收益" />
                    <Bar dataKey="基准" fill="#52c41a" radius={[4, 4, 0, 0]} name="基准收益" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card 
              title="超额收益分布"
              loading={loading}
              extra={
                <Button 
                  type="text" 
                  icon={<DownloadOutlined />} 
                  onClick={() => handleDownloadChart('excess-return-pie-chart', '超额收益分布')}
                >
                  
                </Button>
              }
            >
              <div id="excess-return-pie-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={excessReturnPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(1) : '0.0'}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {excessReturnPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, '超额收益']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default TrendAnalysisPage
