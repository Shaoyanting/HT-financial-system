import React, { useState, useEffect, useMemo, useRef } from 'react'
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
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { getAssetsFromApi, type Asset, type AssetsApiResponse, type GetAssetsParams } from '../services/dataService'
import { formatCurrency, formatPercent, getChangeColorClass } from '../utils/formatters'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

const DataGridPage: React.FC = () => {
  const navigate = useNavigate()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>('all')
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [apiStats, setApiStats] = useState<AssetsApiResponse['data']['stats'] | null>(null)
  const [debouncedSearchText, setDebouncedSearchText] = useState('')

  // 获取资产数据
  const fetchAssets = async (params?: GetAssetsParams) => {
    try {
      setLoading(true)
      const response = await getAssetsFromApi(params)
      if (response.success) {
        console.log('设置资产数据:', {
          dataLength: response.data.data?.length || 0,
          data: response.data.data,
          stats: response.data.stats,
          searchParams: params,
        })
        setAssets(response.data.data)
        setApiStats(response.data.stats)
      } else {
        message.error('加载资产数据失败')
      }
    } catch (error) {
      message.error('加载资产数据失败')
      console.error('加载资产数据错误:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchAssets({
      page: currentPage,
      size: pageSize,
      search: debouncedSearchText,
      industry: assetCategoryFilter !== 'all' ? assetCategoryFilter : '',
      sortBy: sorting.length > 0 ? sorting[0].id : 'currentPrice',
      sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    })
  }, [currentPage, pageSize, debouncedSearchText, assetCategoryFilter, sorting])

  // 使用API统计数据或本地计算统计数据
  const displayStats = useMemo(() => {
    console.log('计算displayStats:', {
      apiStats,
      assetsLength: assets.length,
      assets: assets,
    })
    
    if (apiStats) {
      return {
        totalMarketValue: apiStats.totalMarketValue,
        totalDailyGain: apiStats.totalDailyGain,
        avgChangePercent: apiStats.avgChangePercent,
        count: apiStats.count,
      }
    }
    
    // 如果没有API统计数据，使用本地计算
    const totalMarketValue = assets.reduce((sum, asset) => sum + asset.marketValue, 0)
    const totalDailyGain = assets.reduce((sum, asset) => sum + asset.dailyGain, 0)
    const avgChangePercent = assets.length > 0
      ? assets.reduce((sum, asset) => sum + asset.changePercent, 0) / assets.length
      : 0

    return {
      totalMarketValue,
      totalDailyGain,
      avgChangePercent,
      count: assets.length,
    }
  }, [apiStats, assets])

  // 计算总记录数：优先使用stats.count，如果没有则使用assets.length
  const totalRecords = useMemo(() => {
    if (apiStats && apiStats.count > 0) {
      return apiStats.count
    }
    return assets.length
  }, [apiStats, assets])

  // 获取资产类别颜色
  const getAssetCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      现金: 'green',
      债券: 'blue',
      股票: 'red',
      基金: 'purple',
      商品: 'orange',
      房地产: 'magenta',
      其他: 'cyan',
    }
    return colors[category] || 'default'
  }

  // 分页数据 - 前端分页（因为后端没有实现分页）
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return assets.slice(startIndex, endIndex)
  }, [assets, currentPage, pageSize])

  // 处理页码变化
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page)
    if (size) {
      setPageSize(size)
    }
  }

  // 清除所有筛选条件
  const handleClearFilters = () => {
    setSearchText('')
    setAssetCategoryFilter('all')
    message.success('已清除所有筛选条件')
  }

  // 防抖搜索
  const debounceTimeoutRef = useRef<number | null>(null)

  // 防抖效果：延迟设置搜索文本
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchText(searchText)
    }, 500) // 500ms防抖延迟

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [searchText])

  // 当筛选条件变化时重置页码
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchText, assetCategoryFilter])

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
        accessorKey: 'assetCategory',
        header: '资产类别',
        cell: ({ row }) => (
          <Tag color={getAssetCategoryColor(row.original.assetCategory)}>
            {row.original.assetCategory}
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
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // 移除前端过滤，因为已经由后端处理
    // getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>持仓明细</Title>
        <Text type="secondary">查看和管理所有持仓资产的详细清单</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总资产数量"
              value={displayStats.count}
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarChart3 size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总市值"
              value={displayStats.totalMarketValue}
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
              value={displayStats.totalDailyGain}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ color: displayStats.totalDailyGain >= 0 ? '#52c41a' : '#ff4d4f' }}
              prefix={displayStats.totalDailyGain >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均涨跌幅"
              value={displayStats.avgChangePercent}
              formatter={(value) => formatPercent((value as number) / 100, 2)}
              valueStyle={{ color: displayStats.avgChangePercent >= 0 ? '#52c41a' : '#ff4d4f' }}
              prefix={displayStats.avgChangePercent >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
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
              placeholder="选择资产类别"
              value={assetCategoryFilter}
              onChange={setAssetCategoryFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">所有资产</Option>
              <Option value="现金">现金</Option>
              <Option value="债券">债券</Option>
              <Option value="股票">股票</Option>
              <Option value="基金">基金</Option>
              <Option value="商品">商品</Option>
              <Option value="房地产">房地产</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Space style={{ float: 'right' }}>
              <Tooltip title="清除所有筛选条件">
                <Button 
                  icon={<FilterOutlined />}
                  onClick={handleClearFilters}
                  disabled={!searchText && assetCategoryFilter === 'all'}
                >
                  清除筛选
                </Button>
              </Tooltip>
              <Tooltip title="导出数据">
                <Button icon={<DownloadOutlined />}>导出</Button>
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
            <Badge count={assets.length} showZero />
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

        {assets.length === 0 && !loading && (
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
            显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalRecords)} 条，共 {totalRecords} 条记录
          </Text>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalRecords}
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
