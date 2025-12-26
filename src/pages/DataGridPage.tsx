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
  Pagination,
  DatePicker,
} from 'antd'
import type { MenuProps } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
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
} from '@ant-design/icons'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { getAssetsFromApi, type Asset, type AssetsApiResponse, type GetAssetsParams } from '../services/dataService'
import { formatCurrency, formatPercent, getChangeColorClass } from '../utils/formatters'

const { RangePicker } = DatePicker

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
  // 日期范围筛选状态 - 默认显示近半年数据
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>([
    dayjs().subtract(180, 'day'),
    dayjs(),
  ])

  // 获取资产数据
  const fetchAssets = async (params?: GetAssetsParams) => {
    try {
      setLoading(true)
      const response = await getAssetsFromApi(params)
      if (response.success) {
        console.log('设置资产数据:', {
          dataLength: response.data.data?.length || 0,
          data: response.data.data || [],
          stats: response.data.stats,
          searchParams: params,
        })
        setAssets(response.data.data || [])
        setApiStats(response.data.stats || null)
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

  // 处理日期范围变化
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates)
    setCurrentPage(1) // 重置页码
  }

  // 初始加载和筛选条件变化时重新获取数据
  useEffect(() => {
    const params: GetAssetsParams = {
      page: currentPage,
      size: pageSize,
      search: debouncedSearchText,
      industry: assetCategoryFilter !== 'all' ? assetCategoryFilter : '',
      sortBy: sorting.length > 0 ? sorting[0].id : 'currentPrice',
      sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    }

    // 添加日期参数
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.dateFrom = dateRange[0].format('YYYY-MM-DD')
      params.dateTo = dateRange[1].format('YYYY-MM-DD')
    }

    fetchAssets(params)
  }, [currentPage, pageSize, debouncedSearchText, assetCategoryFilter, sorting, dateRange])

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

  // 分页数据 - 根据后端是否已分页决定是否进行前端分页
  const paginatedAssets = useMemo(() => {
    // 如果有API统计信息且总记录数大于当前资产数量，说明后端已经分页
    // 这种情况下，assets已经是当前页的数据，直接使用
    if (apiStats && apiStats.count > assets.length) {
      return assets
    }
    
    // 否则，进行前端分页
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return assets.slice(startIndex, endIndex)
  }, [assets, currentPage, pageSize, apiStats])

  // 处理页码变化
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page)
    if (size) {
      setPageSize(size)
    }
  }

  // 检查日期范围是否为默认值（近半年）
  const isDefaultDateRange = () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return false
    const defaultStart = dayjs().subtract(180, 'day')
    const defaultEnd = dayjs()
    return dateRange[0].isSame(defaultStart, 'day') && dateRange[1].isSame(defaultEnd, 'day')
  }

  // 清除所有筛选条件
  const handleClearFilters = () => {
    setSearchText('')
    setAssetCategoryFilter('all')
    setDateRange([dayjs().subtract(180, 'day'), dayjs()]) // 重置为近半年
    message.success('已清除所有筛选条件')
  }

  // 导出资产数据
  const handleExportAssets = async () => {
    try {
      // 显示加载提示
      const hideLoading = message.loading('正在导出数据...', 0)
      
      // 构建导出参数
      const exportParams: GetAssetsParams = {
        page: 1,
        size: 1000, // 导出所有数据，设置较大的size值
        search: debouncedSearchText,
        industry: assetCategoryFilter !== 'all' ? assetCategoryFilter : '',
        sortBy: sorting.length > 0 ? sorting[0].id : 'currentPrice',
        sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
        export: true,
      }

      // 添加日期参数
      if (dateRange && dateRange[0] && dateRange[1]) {
        exportParams.dateFrom = dateRange[0].format('YYYY-MM-DD')
        exportParams.dateTo = dateRange[1].format('YYYY-MM-DD')
      }

      // 构建查询字符串
      const queryParams = new URLSearchParams({
        page: exportParams.page!.toString(),
        size: exportParams.size!.toString(),
        search: exportParams.search || '',
        industry: exportParams.industry || '',
        sortBy: exportParams.sortBy || 'currentPrice',
        sortOrder: exportParams.sortOrder || 'desc',
        export: 'true',
      })

      // 添加日期参数到查询字符串
      if (exportParams.dateFrom) {
        queryParams.append('dateFrom', exportParams.dateFrom)
      }
      if (exportParams.dateTo) {
        queryParams.append('dateTo', exportParams.dateTo)
      }

      const queryString = queryParams.toString()

      // 获取token
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('用户未登录')
      }

      // 使用生产环境API地址
      const API_BASE_URL = 'http://101.42.252.64:8080/api'
      const url = `${API_BASE_URL}/assets?${queryString}`

      // 使用fetch直接下载文件
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`导出失败: ${response.status} ${response.statusText}`)
      }

      // 获取文件名
      const contentDisposition = response.headers.get('content-disposition')
      let filename = `资产列表_${new Date().toISOString().split('T')[0]}.csv`
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?$/)
        if (match && match[1]) {
          filename = match[1]
        }
      }

      // 获取blob数据
      const blob = await response.blob()
      
      // 创建下载链接
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 清理URL
      window.URL.revokeObjectURL(downloadUrl)
      
      // 关闭加载提示
      hideLoading()
      message.success('导出成功！')
      
    } catch (error) {
      console.error('导出失败:', error)
      message.error(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
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
  }, [debouncedSearchText, assetCategoryFilter, dateRange])

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
              prefix={<TrendingUp size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均涨跌幅"
              value={displayStats.avgChangePercent}
              formatter={(value) => formatPercent(value as number / 100, 2)}
              valueStyle={{ color: displayStats.avgChangePercent >= 0 ? '#52c41a' : '#ff4d4f' }}
              prefix={<TrendingDown size={20} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选工具栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="搜索资产代码或名称"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setDebouncedSearchText(value)}
              allowClear
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={assetCategoryFilter}
              onChange={setAssetCategoryFilter}
              style={{ width: '100%' }}
              placeholder="资产类别"
            >
              <Option value="all">全部类别</Option>
              <Option value="股票">股票</Option>
              <Option value="债券">债券</Option>
              <Option value="基金">基金</Option>
              <Option value="现金">现金</Option>
              <Option value="商品">商品</Option>
              <Option value="房地产">房地产</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder={['开始日期', '结束日期']}
              allowClear={false}
               presets={[
                    { label: '最近7天', value: [dayjs().subtract(7, 'day'), dayjs()] },
                    { label: '最近30天', value: [dayjs().subtract(30, 'day'), dayjs()] },
                    { label: '最近90天', value: [dayjs().subtract(90, 'day'), dayjs()] },
                    { label: '最近半年', value: [dayjs().subtract(180, 'day'), dayjs()] },
                  ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
            <Space>
              {(!isDefaultDateRange() || searchText || assetCategoryFilter !== 'all') && (
                <Button
                  icon={<FilterOutlined />}
                  onClick={handleClearFilters}
                >
                  清除筛选
                </Button>
              )}
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportAssets}
                loading={loading}
              >
                导出数据
              </Button>
              
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: '1px solid #f0f0f0',
                        backgroundColor: '#fafafa',
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        minWidth: header.getSize(),
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span style={{ marginLeft: 8 }}>
                            {{
                              asc: <ArrowUpOutlined />,
                              desc: <ArrowDownOutlined />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  style={{ 
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    navigate(`/asset/${row.original.id}`)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = ''
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                      }}
                      onClick={(e) => {
                        // 如果是操作列，阻止事件冒泡，避免触发行点击
                        if (cell.column.id === 'actions') {
                          e.stopPropagation()
                        }
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

        {/* 分页 */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text type="secondary">
              显示 {paginatedAssets.length} 条数据，共 {totalRecords} 条
            </Text>
          </div>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalRecords}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
            pageSizeOptions={['10', '20', '50', '100']}
          />
        </div>
      </Card>
    </div>
  )
}

export default DataGridPage
