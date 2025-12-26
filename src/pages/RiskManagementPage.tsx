import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Progress, Statistic, Tag, Alert, Space, Button, Select, message, Tooltip } from 'antd'
import { WarningOutlined, SafetyOutlined, LineChartOutlined, DownloadOutlined } from '@ant-design/icons'
import { Shield, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { getRiskMetrics, getDrawdownData } from '../services/dataService'
import type { RiskMetrics, DrawdownDataPoint } from '../services/dataService'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const RiskManagementPage: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null)
  const [drawdownData, setDrawdownData] = useState<DrawdownDataPoint[]>([])
  const [timeRange, setTimeRange] = useState('1y')
  const [exportLoading, setExportLoading] = useState(false)

  // 根据时间范围获取对应的天数
  const getDaysFromTimeRange = (range: string): number => {
    switch (range) {
      case '1m': return 30
      case '3m': return 90
      case '6m': return 180
      case '1y': return 365
      default: return 365
    }
  }

  // 获取回撤数据
  const fetchDrawdownData = async (range: string) => {
    try {
      const days = getDaysFromTimeRange(range)
      const drawdown = await getDrawdownData(days)
      setDrawdownData(drawdown)
    } catch (error) {
      console.error('加载回撤数据错误:', error)
    }
  }

  // 获取风险指标数据
  const fetchRiskMetrics = async () => {
    try {
      const metrics = await getRiskMetrics()
      setRiskMetrics(metrics)
    } catch (error) {
      console.error('加载风险指标错误:', error)
    }
  }

  // 初始化数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchRiskMetrics(),
          fetchDrawdownData(timeRange),
        ])
      } catch (error) {
        console.error('加载风险数据错误:', error)
      }
    }

    fetchData()
  }, [])

  // 时间范围变化时重新获取回撤数据
  useEffect(() => {
    const loadData = async () => {
      if (timeRange) {
        await fetchDrawdownData(timeRange)
      }
    }
    loadData()
  }, [timeRange])

  // 模拟风险事件数据
  const riskEvents = [
    { date: '2024-01-15', type: '市场风险', severity: '高', description: '股市大幅下跌', impact: '-5.2%', status: '已处理' },
    { date: '2024-02-28', type: '流动性风险', severity: '中', description: '债券市场流动性紧张', impact: '-2.1%', status: '监控中' },
    { date: '2024-03-10', type: '信用风险', severity: '低', description: '个别债券信用评级下调', impact: '-0.8%', status: '已处理' },
    { date: '2024-04-22', type: '操作风险', severity: '中', description: '交易系统故障', impact: '-1.5%', status: '已修复' },
    { date: '2024-05-05', type: '市场风险', severity: '高', description: '利率大幅上升', impact: '-3.7%', status: '监控中' },
    { date: '2024-06-18', type: '汇率风险', severity: '中', description: '美元汇率大幅波动', impact: '-2.3%', status: '已对冲' },
  ]

  // 模拟压力测试结果
  const stressTestResults = [
    { scenario: '股市下跌30%', impact: '-15.2%', probability: '低', color: '#f5222d' },
    { scenario: '利率上升2%', impact: '-8.7%', probability: '中', color: '#fa8c16' },
    { scenario: '汇率波动20%', impact: '-6.3%', probability: '中', color: '#faad14' },
    { scenario: '流动性危机', impact: '-12.5%', probability: '低', color: '#f5222d' },
    { scenario: '信用事件', impact: '-9.8%', probability: '低', color: '#fa8c16' },
  ]

  // 模拟风险指标趋势
  const riskTrendData = [
    { month: '1月', var: 2.1, cvar: 3.5, volatility: 12.5 },
    { month: '2月', var: 2.3, cvar: 3.8, volatility: 13.2 },
    { month: '3月', var: 2.8, cvar: 4.2, volatility: 14.1 },
    { month: '4月', var: 2.5, cvar: 3.9, volatility: 13.5 },
    { month: '5月', var: 2.9, cvar: 4.5, volatility: 14.8 },
    { month: '6月', var: 3.1, cvar: 4.8, volatility: 15.2 },
    { month: '7月', var: 2.7, cvar: 4.1, volatility: 13.9 },
    { month: '8月', var: 2.4, cvar: 3.7, volatility: 13.0 },
    { month: '9月', var: 2.6, cvar: 4.0, volatility: 13.7 },
    { month: '10月', var: 2.9, cvar: 4.4, volatility: 14.5 },
    { month: '11月', var: 3.0, cvar: 4.6, volatility: 14.9 },
    { month: '12月', var: 2.8, cvar: 4.3, volatility: 14.3 },
  ]

  // 处理导出 - 下载所有卡片为一张图片
  const handleExportAll = async () => {
    try {
      setExportLoading(true)
      message.loading({ content: '正在生成风险报告截图...', key: 'export', duration: 0 })
      
      // 动态导入html2canvas
      const html2canvas = (await import('html2canvas')).default
      
      // 获取包含所有卡片的DOM元素
      const element = document.querySelector('.risk-management-cards')
      
      if (!element) {
        message.error({ content: '未找到要导出的内容', key: 'export' })
        setExportLoading(false)
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
      link.download = `风险报告_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.png`
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      message.success({ content: '风险报告导出成功！', key: 'export' })
      
    } catch (error) {
      console.error('导出失败:', error)
      message.error({ content: '导出失败，请重试', key: 'export' })
    } finally {
      setExportLoading(false)
    }
  }

  // 风险等级颜色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '高': return '#f5222d'
      case '中': return '#fa8c16'
      case '低': return '#52c41a'
      default: return '#d9d9d9'
    }
  }

  // 风险状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '已处理': return '#52c41a'
      case '监控中': return '#fa8c16'
      case '已修复': return '#1890ff'
      case '已对冲': return '#722ed1'
      default: return '#d9d9d9'
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>风险管理</Title>
        <Text type="secondary">监控和管理投资组合的风险暴露，确保风险控制在可接受范围内</Text>
      </div>

      {/* 风险概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Alert
            message="当前风险状态：中等风险"
            description="投资组合整体风险处于可控范围内，建议关注市场波动和流动性风险"
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            action={
              <Space>
                <Button 
                  size="small" 
                  type="primary"
                  onClick={handleExportAll}
                  loading={exportLoading}
                  icon={<DownloadOutlined />}
                >
                  风险报告
                </Button>
              </Space>
            }
          />
        </Col>
      </Row>

      {/* 卡片容器 - 用于导出功能 */}
      <div className="risk-management-cards">
        {/* 核心风险指标 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <Tooltip 
            title="VaR(95%)=95%置信度下的日最大可能损失"
            placement="top"
          >
          <Card>
            <Statistic
              title="VaR (95%)"
              value={riskMetrics?.var95 || 2.8}
              suffix="%"
              valueStyle={{ color: '#f5222d' }}
              prefix={<Shield size={16} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>日度风险价值</Text>
          </Card>
          </Tooltip>
        </Col>
        <Col xs={24} sm={12} lg={4}>
        <Tooltip 
            title="CVaR（95%）=超过VaR部分的平均损失”"
            placement="top"
          >
          <Card>
            <Statistic
              title="CVaR (95%)"
              value={riskMetrics?.cvar95 || 4.3}
              suffix="%"
              valueStyle={{ color: '#fa8c16' }}
              prefix={<AlertTriangle size={16} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>条件风险价值</Text>
          </Card></Tooltip>
        </Col>
        <Col xs={24} sm={12} lg={4}>
        <Tooltip 
            title="压力测试基于历史极端市场情景模拟"
            placement="top"
          >
          <Card>
            <Statistic
              title="压力测试损失"
              value={riskMetrics?.stressTestLoss || 12.5}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
              prefix={<TrendingDown size={16} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>极端情景损失</Text>
          </Card></Tooltip>
        </Col>
        <Col xs={24} sm={12} lg={4}>
        <Tooltip 
            title="流动性缺口=变现所需时间/市场平均变现时间"
            placement="top"
          >
          <Card>
            <Statistic
              title="流动性风险"
              value={riskMetrics?.liquidityRisk || 3.2}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              prefix={<LineChartOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>流动性缺口</Text>
          </Card></Tooltip>
        </Col>
        <Col xs={24} sm={12} lg={4}>
        <Tooltip 
            title="集中度风险=前十大持仓市值/总资产×100%(95%)=95%置信度下的日最大可能损失"
            placement="top"
          >
          <Card>
            <Statistic
              title="集中度风险"
              value={riskMetrics?.concentrationRisk || 18.5}
              suffix="%"
              valueStyle={{ color: '#13c2c2' }}
              prefix={<BarChart3 size={16} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>前十大持仓占比</Text>
          </Card></Tooltip>
        </Col>
        <Col xs={24} sm={12} lg={4}>
        <Tooltip 
            title="信用风险基于持仓标的信用评级综合计算"
            placement="top"
          >
          <Card>
            <Statistic
              title="信用风险"
              value={riskMetrics?.creditRisk || 2.1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<SafetyOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>违约概率</Text>
          </Card></Tooltip>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="回撤分析"
            extra={
              <Select value={timeRange} onChange={setTimeRange} size="small">
                <Option value="1m">1个月</Option>
                <Option value="3m">3个月</Option>
                <Option value="6m">6个月</Option>
                <Option value="1y">1年</Option>
              </Select>
            }
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={drawdownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" label={{ value: '价格', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: '回撤 (%)', angle: 90, position: 'insideRight' }} />
                  <RechartsTooltip 
                    formatter={(value: number | string | undefined, name?: string) => {
                      const val = value ?? ''
                      if (name === 'price') return [`¥${val}`, '价格']
                      if (name === 'drawdown') return [`${val}%`, '回撤']
                      return [val, name || '']
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="price"
                    stroke="#1890ff"
                    strokeWidth={2}
                    name="价格"
                    dot={false}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="drawdown"
                    stroke="#f5222d"
                    fill="#ff4d4f"
                    fillOpacity={0.3}
                    name="最大回撤"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="风险指标趋势">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: '风险值 (%)', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip formatter={(value: number | string | undefined) => [`${value ?? ''}%`, '风险值']} />
                  <Legend />
                  <Line type="monotone" dataKey="var" stroke="#f5222d" strokeWidth={2} name="VaR" />
                  <Line type="monotone" dataKey="cvar" stroke="#fa8c16" strokeWidth={2} name="CVaR" />
                  <Line type="monotone" dataKey="volatility" stroke="#1890ff" strokeWidth={2} name="波动率" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 风险事件和压力测试 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="近期风险事件"
            extra={
              <Button type="link" size="small">
                查看全部
              </Button>
            }
          >
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {riskEvents.map((event, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < riskEvents.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Tag color={getSeverityColor(event.severity)}>{event.severity}</Tag>
                      <Text strong>{event.type}</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{event.description}</Text>
                    <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>{event.date}</Text>
                      <Text type="danger" style={{ fontSize: 12 }}>{event.impact}</Text>
                    </div>
                  </div>
                  <Tag color={getStatusColor(event.status)}>{event.status}</Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="压力测试结果">
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {stressTestResults.map((test, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px 0',
                    borderBottom: index < stressTestResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong>{test.scenario}</Text>
                    <Tag color={test.color}>{test.probability}概率</Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <Progress
                        percent={Math.abs(parseFloat(test.impact)) * 5}
                        strokeColor={test.color}
                        showInfo={false}
                        size="small"
                      />
                    </div>
                    <Text type="danger" strong>{test.impact}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

        {/* 风险控制建议 */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="风险控制建议">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Card size="small" title="市场风险" extra={<Tag color="red">高</Tag>}>
                    <Space direction="vertical" size="small">
                      <Text>建议降低股票仓位至60%以下</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>增加对冲工具使用</Text>
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card size="small" title="流动性风险" extra={<Tag color="orange">中</Tag>}>
                    <Space direction="vertical" size="small">
                      <Text>建议保持10%以上的现金比例</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>优化资产流动性结构</Text>
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card size="small" title="信用风险" extra={<Tag color="green">低</Tag>}>
                    <Space direction="vertical" size="small">
                      <Text>建议分散债券投资，避免单一发行人</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>定期审查信用评级</Text>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default RiskManagementPage
