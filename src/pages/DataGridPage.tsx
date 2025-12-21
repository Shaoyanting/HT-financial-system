import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Input,
  Select,
  Button,
  Space,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Dropdown,
  message,
  Tooltip,
  Badge,
  Pagination,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { TrendingUp, TrendingDown, BarChart3, Filter } from 'lucide-react'
import { flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { getAssets, type Asset } from '../services/dataService'
import { formatCurrency, formatPercent, getChangeColorClass } from '../utils/formatters'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

const DataGridPage: React.FC = () => {
  const navigate = useNavigate()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true)
        const data = await getAssets()
        setAssets(data)
      } catch (error) {
        message.error('加载资产数据失败')
        console.error('加载资产数据错误:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [])

  // 获取所有行业
  const industries = useMemo(() => {
    const uniqueIndustries = Array.from(new Set(assets.map(asset => asset.industry)))
    return ['all', ...uniqueIndustries]
  }, [assets])

  // 获取行业颜色
  const getIndustryColor = (industry: string) => {
    const colors: Record<string, string> = {
      科技: 'blue',
      金融: 'green',
      消费: 'orange',
      医疗: 'red',
      能源: 'purple',
      工业: 'cyan',
      房地产: 'magenta',
      材料: 'gold',
      公用事业: 'lime',
      通信服务: 'geekblue',
    }
    return colors[industry] || 'default'
  }

  // 过滤数据
  const filteredAssets = useMemo(() => {
    let filtered = assets
    if (searchText) {
      const lowerSearch = searchText.toLowerCase()
      filtered = filtered.filter(
        asset =>
          asset.code.toLowerCase().includes(lowerSearch) ||
          asset.name.toLowerCase().includes(lowerSearch)
      )
    }
    if (industryFilter && industryFilter !== 'all') {
      filtered = filtered.filter(asset => asset.industry === industryFilter)
    }
    return filtered
  }, [assets, searchText, industryFilter])

  // 统计数据
  const stats = useMemo(() => {
    const totalMarketValue = filteredAssets.reduce((sum, asset) => sum + asset.marketValue, 0)
    const totalDailyGain = filteredAssets.reduce((sum, asset) => sum + asset.dailyGain, 0)
    const avgChangePercent = filteredAssets.length > 0
      ? filteredAssets.reduce((sum, asset) => sum + asset.changePercent, 0) / filteredAssets.length
      : 0

    return {
      totalMarketValue,
      totalDailyGain,
      avgChangePercent,
      count: filteredAssets.length,
    }
  }, [filteredAssets])

  // 分页数据
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAssets.slice(startIndex, endIndex)
  }, [filteredAssets, currentPage, pageSize])

  // 处理页码变化
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page)
    if (size) {
      setPageSize(size)
    }
  }

  // 当筛选条件变化时重置页码
  useEffect(() => {
    setCurrentPage(1)
  }, [searchText, industryFilter])

  // 定义表格列
  const columns = useMemo<ColumnDef<Asset>[]>(
    () => [
      {
        accessorKey: 'code',
        header: '代码',
        cell: ({ row }) => (
          <div>
            <div style={{ fontWeight: 600 }}>{row.original.code}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {row.original.name}
            </Text>
          </div>
        ),
        size: 150,
      },
      {
        accessorKey: 'currentPrice',
        header: '当前价格',
        cell: ({ row }) => formatCurrency(row.original.currentPrice, '¥', 2),
        size: 120,
      },
      {
        accessorKey: 'changePercent',
        header: '涨跌幅',
        cell: ({ row }) => {
          const change = row.original.changePercent
          const colorClass = getChangeColorClass(change)
          return (
            <div className={colorClass} style={{ fontWeight: 600 }}>
              {change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {formatPercent(change / 100, 2)}
            </div>
          )
        },
        size: 120,
      },
      {
        accessorKey: 'marketValue',
        header: '市值',
        cell: ({ row }) => formatCurrency(row.original.marketValue, '¥', 0),
        size: 140,
      },
      {
        accessorKey: 'industry',
        header: '行业',
        cell: ({ row }) => (
          <Tag color={getIndustryColor(row.original.industry)}>
            {row.original.industry}
          </Tag>
        ),
        size: 120,
      },
      {
        accessorKey: 'position',
        header: '持仓',
        cell: ({ row }) => row.original.position.toLocaleString(),
        size: 120,
      },
      {
        accessorKey: 'dailyGain',
        header: '当日盈亏',
        cell: ({ row }) => {
          const gain = row.original.dailyGain
          return (
            <Text type={gain >= 0 ? 'success' : 'danger'}>
              {formatCurrency(gain)}
            </Text>
          )
        },
        size: 120,
      },
      {
        accessorKey: 'weight',
        header: '权重',
        cell: ({ row }) => `${(row.original.weight || 0).toFixed(2)}%`,
        size: 100,
      },
      {
        accessorKey: 'pe',
        header: '市盈率',
        cell: ({ row }) => (row.original.pe || 0).toFixed(2),
        size: 100,
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => {
          const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
            if (key === 'view') {
              navigate(`/asset/${row.original.id}`)
            } else if (key === 'edit') {
              message.info(`编辑资产: ${row.original.code}`)
            } else if (key === 'delete') {
              message.warning(`删除资产: ${row.original.code}`)
            }
          }

          const menuItems: MenuProps['items'] = [
            {
              key: 'view',
              icon: <EyeOutlined />,
              label: '查看详情',
            },
            {
              key: 'edit',
              icon: <EditOutlined />,
              label: '编辑',
            },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: '删除',
              danger: true,
            },
          ]

          return (
            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          )
        },
        size: 80,
      },
    ],
    []
  )

  // 使用React Table
  const table = useReactTable({
    data: paginatedAssets,
    columns,
    state: {
      sorting,
      globalFilter: searchText,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>数据列表</Title>
        <Text type="secondary">查看和管理所有持仓资产的详细清单</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总资产数量"
              value={stats.count}
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarChart3 size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总市值"
              value={stats.totalMarketValue}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ color: '#52c41a' }}
              prefix={<TrendingUp size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总当日盈亏"
              value={stats.totalDailyGain}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ color: stats.totalDailyGain >= 0 ? '#52c41a' : '#ff4d4f' }}
              prefix={stats.totalDailyGain >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均涨跌幅"
              value={stats.avgChangePercent}
              formatter={(value) => formatPercent((value as number) / 100, 2)}
              valueStyle={{ color: stats.avgChangePercent >= 0 ? '#52c41a' : '#ff4d4f' }}
              prefix={stats.avgChangePercent >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 过滤和搜索栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="搜索资产代码或名称"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              onSearch={(value) => setSearchText(value)}
              enterButton
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="选择行业"
              value={industryFilter}
              onChange={setIndustryFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">所有行业</Option>
              {industries
                .filter(ind => ind !== 'all')
                .map((industry) => (
                  <Option key={industry} value={industry}>
                    {industry}
                  </Option>
                ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Space style={{ float: 'right' }}>
              <Tooltip title="导出数据">
                <Button icon={<DownloadOutlined />}>导出</Button>
              </Tooltip>
              <Tooltip title="更多筛选">
                <Button icon={<Filter size={16} />}>高级筛选</Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card
        title={
          <Space>
            <FilterOutlined />
            <span>资产列表</span>
            <Badge count={filteredAssets.length} showZero />
          </Space>
        }
        extra={
          <Text type="secondary">
            更新时间: {new Date().toLocaleString()}
          </Text>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      style={{
                        padding: '12px 8px',
                        textAlign: 'left',
                        fontWeight: 600,
                        backgroundColor: '#fafafa',
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        minWidth: header.getSize(),
                      }}
                      onClick={(e) => header.column.getToggleSortingHandler()?.(e)}
                    >
                      <Space>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ArrowUpOutlined style={{ fontSize: 12 }} />,
                          desc: <ArrowDownOutlined style={{ fontSize: 12 }} />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </Space>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => navigate(`/asset/${row.original.id}`)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      style={{
                        padding: '12px 8px',
                        minWidth: cell.column.getSize(),
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">未找到匹配的资产数据</Text>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">加载中...</Text>
          </div>
        )}

        {/* 分页信息 */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">
            显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredAssets.length)} 条，共 {filteredAssets.length} 条记录
          </Text>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredAssets.length}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} 条，共 ${total} 条`}
            pageSizeOptions={['10', '20', '50', '100']}
            prevIcon={<LeftOutlined />}
            nextIcon={<RightOutlined />}
          />
        </div>
      </Card>
    </div>
  )
}

export default DataGridPage
