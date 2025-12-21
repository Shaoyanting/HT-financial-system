import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Row, Col, Card, Typography, Statistic, Tag, Button, Descriptions, Space, Divider, Timeline, Progress, Alert } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DownloadOutlined, ShareAltOutlined, StarOutlined, LineChartOutlined } from '@ant-design/icons'
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Calendar, Building, Globe } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getAssetById, getAssetHistory } from '../services/dataService'
import { formatCurrency, formatPercent, getChangeColorClass } from '../utils/formatters'
import type { Asset } from '../services/dataService'

const { Title, Text } = Typography

const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [historyData, setHistoryData] = useState<Array<{date: string; price: number; volume: number}>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setLoading(true)
        const [assetData, history] = await Promise.all([
          getAssetById(id),
          getAssetHistory(id, 30), // 获取最近30天的历史数据
        ])
        setAsset(assetData)
        setHistoryData(history)
      } catch (error) {
        console.error('加载资产详情错误:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // 模拟相关资产数据
  const relatedAssets = [
    { id: '1', code: 'AAPL', name: '苹果公司', change: 2.5, price: 182.63 },
    { id: '2', code: 'MSFT', name: '微软公司', change: 1.8, price: 415.86 },
    { id: '3', code: 'GOOGL', name: '谷歌', change: -0.5, price: 175.42 },
    { id: '4', code: 'AMZN', name: '亚马逊', change: 3.2, price: 178.21 },
  ]

  // 模拟新闻数据
  const newsItems = [
    { time: '2024-12-20', content: '公司发布第四季度财报，营收超出预期' },
    { time: '2024-12-18', content: '宣布与主要合作伙伴达成战略合作协议' },
    { time: '2024-12-15', content: '获得重要专利授权，技术优势进一步巩固' },
    { time: '2024-12-10', content: '行业分析师上调目标价至¥85.00' },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Text type="secondary">加载中...</Text>
      </div>
    )
  }

  if (!asset) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Alert
          message="资产不存在"
          description="请求的资产数据不存在或已被删除"
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/data-grid')}>
              返回数据列表
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      {/* 头部导航 */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/data-grid')}
          style={{ marginBottom: 16 }}
        >
          返回数据列表
        </Button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2}>
              {asset.code} - {asset.name}
              <Tag color={getChangeColorClass(asset.changePercent)} style={{ marginLeft: 12 }}>
                {asset.changePercent > 0 ? '+' : ''}{formatPercent(asset.changePercent / 100, 2)}
              </Tag>
            </Title>
            <Text type="secondary">
              <Space>
                <Building size={16} />
                {asset.industry}
                <Divider type="vertical" />
                <Globe size={16} />
                股票代码: {asset.code}
                <Divider type="vertical" />
                <Calendar size={16} />
                最后更新: {new Date().toLocaleDateString()}
              </Space>
            </Text>
          </div>
          
          <Space>
            <Button icon={<StarOutlined />}>关注</Button>
            <Button icon={<EditOutlined />}>编辑</Button>
            <Button icon={<DownloadOutlined />}>导出</Button>
            <Button icon={<ShareAltOutlined />}>分享</Button>
          </Space>
        </div>
      </div>

      {/* 关键指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="当前价格"
              value={asset.currentPrice}
              prefix={<DollarSign size={16} />}
              valueStyle={{ color: '#1890ff' }}
              suffix="¥"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="涨跌幅"
              value={asset.changePercent}
              prefix={asset.changePercent > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              valueStyle={{ color: asset.changePercent >= 0 ? '#52c41a' : '#f5222d' }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="市值"
              value={asset.marketValue}
              prefix={<BarChart3 size={16} />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => formatCurrency(value as number)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="市盈率"
              value={asset.pe || 0}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表和详细信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="价格走势">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`¥${value}`, '价格']} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#1890ff"
                    fill="#1890ff"
                    fillOpacity={0.3}
                    name="价格"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="资产信息">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="资产代码">{asset.code}</Descriptions.Item>
              <Descriptions.Item label="资产名称">{asset.name}</Descriptions.Item>
              <Descriptions.Item label="行业分类">
                <Tag color="blue">{asset.industry}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前价格">
                <Text strong>{formatCurrency(asset.currentPrice, '¥', 2)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="持仓数量">
                {asset.position.toLocaleString()} 股
              </Descriptions.Item>
              <Descriptions.Item label="持仓市值">
                {formatCurrency(asset.marketValue)}
              </Descriptions.Item>
              <Descriptions.Item label="权重">
                <Progress percent={asset.weight} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="当日盈亏">
                <Text type={asset.dailyGain >= 0 ? 'success' : 'danger'}>
                  {formatCurrency(asset.dailyGain)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="市盈率">
                {(asset.pe || 0).toFixed(2)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* 相关资产和新闻 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="相关资产">
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {relatedAssets.map((relatedAsset) => (
                <div
                  key={relatedAsset.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/asset/${relatedAsset.id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{relatedAsset.code}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {relatedAsset.name}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>
                      {formatCurrency(relatedAsset.price, '¥', 2)}
                    </div>
                    <Text
                      type={relatedAsset.change >= 0 ? 'success' : 'danger'}
                      style={{ fontSize: 12 }}
                    >
                      {relatedAsset.change > 0 ? '+' : ''}{relatedAsset.change}%
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最新动态">
            <Timeline>
              {newsItems.map((item, index) => (
                <Timeline.Item key={index}>
                  <div>
                    <Text strong>{item.content}</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.time}
                      </Text>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* 操作按钮 */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Space>
          <Button type="primary">添加到观察列表</Button>
          <Button>设置价格提醒</Button>
          <Button>生成分析报告</Button>
          <Button danger>从组合中移除</Button>
        </Space>
      </div>
    </div>
  )
}

export default AssetDetailPage
