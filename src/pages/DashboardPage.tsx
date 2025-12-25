import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Spin,
  Alert,
  DatePicker,
  Button,
  Popover,
  Tooltip,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  LineChartOutlined,
  PieChartOutlined,
  SafetyOutlined,
  CalendarOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { TrendingUp, Wallet, BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  getPortfolioMetrics,
  getAssetAllocation,
  getDashboardMetricsFromApi,
  getDashboardAllocationFromApi,
  getDashboardPerformanceFromApi,
} from "../services/dataService";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { downloadChart } from "../utils/chartDownload";
import type {
  PortfolioMetrics,
  AssetAllocation,
} from "../services/dataService";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const { RangePicker } = DatePicker;

// 日期范围类型
type DateRangeType = '7days' | '30days'|'90days' | '180days' | 'custom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [allocation, setAllocation] = useState<AssetAllocation[]>([]);
  const [apiPerformanceData, setApiPerformanceData] = useState<Array<{date: string; portfolio: number; benchmark: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // 日期范围状态
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('180days');
  const [customDateRange, setCustomDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Dayjs; end: Dayjs }>({
    start: dayjs().subtract(180, 'day'),
    end: dayjs(),
  });
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // 更新日期范围
  const updateDateRange = (type: DateRangeType, customRange?: [Dayjs, Dayjs] | null) => {
    let start: Dayjs;
    let end: Dayjs = dayjs();
    
    switch (type) {
      case '7days':
        start = dayjs().subtract(7, 'day');
        break;
      case '30days':
        start = dayjs().subtract(30, 'day');
        break;
      case '90days':
        start = dayjs().subtract(90, 'day');
        break;
      case '180days':
        start = dayjs().subtract(180, 'day');
        break;
      case 'custom':
        if (customRange) {
          start = customRange[0];
          end = customRange[1];
        } else {
          start = dayjs().subtract(7, 'day');
        }
        break;
      default:
        start = dayjs().subtract(180, 'day');
    }
    
    setDateRange({ start, end });
    setDateRangeType(type);
    
    if (type === 'custom') {
      setCustomDateRange(customRange || null);
    } else {
      setCustomDateRange(null);
    }
  };

  // 处理自定义日期范围变化
  const handleCustomDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      updateDateRange('custom', [dates[0], dates[1]]);
      console.log(dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
      
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 并行调用三个API接口
      const [metricsApiResponse, allocationApiResponse, performanceApiResponse] = await Promise.all([
        // 调用仪表板指标API
        getDashboardMetricsFromApi(
          dateRange.start.format('YYYY-MM-DD'),
          dateRange.end.format('YYYY-MM-DD')
        ),
        // 调用资产分配API
        getDashboardAllocationFromApi(
          dateRange.start.format('YYYY-MM-DD'),
          dateRange.end.format('YYYY-MM-DD')
        ),
        // 调用业绩趋势API
        getDashboardPerformanceFromApi(
          dateRange.start.format('YYYY-MM-DD'),
          dateRange.end.format('YYYY-MM-DD')
        ),
      ]);
      
      // 处理仪表板指标数据
      if (metricsApiResponse.success) {
        // 将API返回的数据转换为PortfolioMetrics类型
        const metricsData: PortfolioMetrics = {
          totalAssets: metricsApiResponse.data.totalAssets,
          dailyPnL: metricsApiResponse.data.dailyPnL,
          totalPnL: metricsApiResponse.data.totalPnL,
          sharpeRatio: metricsApiResponse.data.sharpeRatio,
          maxDrawdown: metricsApiResponse.data.maxDrawdown,
          volatility: metricsApiResponse.data.volatility,
          beta: metricsApiResponse.data.beta,
          alpha: metricsApiResponse.data.alpha,
          winRate: metricsApiResponse.data.winRate,
          avgReturn: metricsApiResponse.data.avgReturn,
        };
        
        setMetrics(metricsData);
      } else {
        // 如果API调用失败，使用模拟数据
        const metricsData = await getPortfolioMetrics(
          dateRange.start.format('YYYY-MM-DD'),
          dateRange.end.format('YYYY-MM-DD')
        );
        setMetrics(metricsData);
      }
      
      // 处理资产分配数据
      if (allocationApiResponse.success) {
        // 合并相同类别的数据
        const categoryMap = new Map<string, { totalValue: number; color: string; count: number }>();
        
        allocationApiResponse.data.forEach(item => {
          if (categoryMap.has(item.category)) {
            const existing = categoryMap.get(item.category)!;
            existing.totalValue += item.value;
            existing.count += 1;
          } else {
            categoryMap.set(item.category, {
              totalValue: item.value,
              color: item.color,
              count: 1
            });
          }
        });
        
        // 计算每个类别的平均值，并保留两位小数
        const allocationData: AssetAllocation[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          value: parseFloat((data.totalValue / data.count).toFixed(2)), // 计算平均值并保留两位小数
          color: data.color,
        }));
        
        // 确保只有7类数据（如果超过7类，取前7类）
        const finalAllocationData = allocationData.slice(0, 7);
        
        console.log('处理后的资产分配数据:', {
          原始数据条数: allocationApiResponse.data.length,
          合并后类别数: categoryMap.size,
          最终显示条数: finalAllocationData.length,
          数据: finalAllocationData,
        });
        
        setAllocation(finalAllocationData);
      } else {
        // 如果API调用失败，使用模拟数据
        const allocationData = await getAssetAllocation();
        setAllocation(allocationData);
      }
      
      // 处理业绩趋势数据
      if (performanceApiResponse.success) {
        // 设置API返回的业绩趋势数据
        setApiPerformanceData(performanceApiResponse.data);
      } else {
        // 如果API调用失败，使用模拟数据
        setApiPerformanceData([
          { date: "2024-01", portfolio: 100, benchmark: 100 },
          { date: "2024-02", portfolio: 105, benchmark: 102 },
          { date: "2024-03", portfolio: 108, benchmark: 105 },
          { date: "2024-04", portfolio: 112, benchmark: 108 },
          { date: "2024-05", portfolio: 115, benchmark: 110 },
          { date: "2024-06", portfolio: 118, benchmark: 112 },
        ]);
      }
      
    } catch (err) {
      setError("加载数据失败，请稍后重试");
      console.error("数据加载错误:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  // 将API返回的业绩趋势数据转换为图表格式
  const performanceData = apiPerformanceData.length > 0 
    ? apiPerformanceData.map(item => ({
        month: item.date,
        收益率: item.portfolio - 100, // 转换为收益率百分比
        基准: item.benchmark - 100,   // 转换为基准收益率百分比
      }))
    : [
        { month: "1月", 收益率: 2.5, 基准: 1.8 },
        { month: "2月", 收益率: 3.2, 基准: 2.1 },
        { month: "3月", 收益率: 1.8, 基准: 1.5 },
        { month: "4月", 收益率: 4.1, 基准: 3.2 },
        { month: "5月", 收益率: 2.9, 基准: 2.4 },
        { month: "6月", 收益率: 3.5, 基准: 2.8 },
      ];

  const recentActivities = [
    {
      time: "10:30",
      action: "买入",
      asset: "AAPL",
      amount: "¥50,000",
      status: "成功",
    },
    {
      time: "昨天",
      action: "卖出",
      asset: "GOOGL",
      amount: "¥32,500",
      status: "成功",
    },
    {
      time: "2天前",
      action: "调仓",
      asset: "投资组合",
      amount: "¥120,000",
      status: "进行中",
    },
    {
      time: "3天前",
      action: "买入",
      asset: "TSLA",
      amount: "¥28,000",
      status: "成功",
    },
  ];

  // 刷新数据函数
  const handleRefresh = () => {
    fetchData();
  };

  // 下载业绩趋势图表
  const handleDownloadPerformanceChart = async () => {
    await downloadChart('performance-chart', '业绩趋势');
  };

  // 下载资产分布图表
  const handleDownloadAllocationChart = async () => {
    await downloadChart('allocation-chart', '资产分布');
  };

  // 最近七天数据按钮处理函数
  const handleLast7Days = () => {
    updateDateRange('180days');
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2}>资产总览</Title>
          <Text type="secondary">实时监控您的投资组合表现和关键指标</Text>
        </div>
        <Space>
          <Button 
            onClick={handleLast7Days}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      </div>

      {/* 关键指标卡片 - 5个卡片在同一行且高度对齐 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24, display: 'flex', flexWrap: 'nowrap' }}>
        <Col xs={4} style={{ display: 'flex' }}>
          <Popover
            content={
              <div style={{ width: 300 }}>
                <RangePicker
                  value={customDateRange}
                  onChange={handleCustomDateRangeChange}
                  style={{ width: '100%' }}
                  presets={[
                    { label: '最近7天', value: [dayjs().subtract(7, 'day'), dayjs()] },
                    { label: '最近30天', value: [dayjs().subtract(30, 'day'), dayjs()] },
                    { label: '最近90天', value: [dayjs().subtract(90, 'day'), dayjs()] },
                    { label: '最近半年', value: [dayjs().subtract(180, 'day'), dayjs()] },
                  ]}
                />
              </div>
            }
            title="选择时间范围"
            trigger="click"
            placement="bottomLeft"
            open={datePickerVisible}
            onOpenChange={setDatePickerVisible}
          >
            <Card style={{ cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="时间范围"
                  value={(() => {
                    switch (dateRangeType) {
                      case '7days':
                        return '近7天';
                      case '30days':
                        return '近30天';
                      case '90days':
                        return '近一季度';
                      case '180days':
                        return '近半年';
                      case 'custom':
                        return `${dateRange.start.format('MM-DD')} 至 ${dateRange.end.format('MM-DD')}`;
                      default:
                        return '近180天';
                    }
                  })()}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: "#1890ff", fontSize: 20 }}
                />
                <Space style={{ marginTop: 8 }}>
                  <Text type="secondary">当前范围</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(dateRange.end).diff(dayjs(dateRange.start), 'day')} 天
                  </Text>
                </Space>
              </div>
            </Card>
          </Popover>
        </Col>
        
        <Col xs={5} style={{ display: 'flex' }}>
          <Tooltip 
            title="(本月总资产 - 上月总资产) ÷ 上月总资产 × 100%"
            placement="top"
          >
            <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={handleRefresh}>
              <div style={{ flex: 1 }}>
                <Statistic
                  title="总资产"
                  value={metrics?.totalAssets || 0}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(value as number)}
                  valueStyle={{ color: "#1890ff" }}
                />
                <Space style={{ marginTop: 8 }}>
                  <Text type="secondary">较上月</Text>
                  <Text type="success">
                    <ArrowUpOutlined /> +2.3%
                  </Text>
                </Space>
              </div>
            </Card>
          </Tooltip>
        </Col>
        
        <Col xs={5} style={{ display: 'flex' }}>
        <Tooltip 
            title="盈利金额显示绿色，亏损显示红色"
            placement="top"
          >
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column',cursor: 'pointer' }} onClick={() => navigate('/data-grid')}>
            <div style={{ flex: 1 }}>
              <Statistic
                title="当日盈亏"
                value={metrics?.dailyPnL || 0}
                prefix={
                  metrics?.dailyPnL && metrics.dailyPnL >= 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )
                }
                formatter={(value) => formatCurrency(value as number)}
                valueStyle={{
                  color:
                    metrics?.dailyPnL && metrics.dailyPnL >= 0
                      ? "#52c41a"
                      : "#ff4d4f",
                }}
              />
              <Space style={{ marginTop: 8 }}>
                <Text type="secondary">平均涨跌幅</Text>
                <Text type="success">
                  {formatPercent(metrics?.avgReturn || 0)}
                </Text>
              </Space>
            </div>
          </Card></Tooltip>
        </Col>
        
        <Col xs={5} style={{ display: 'flex' }}>
         <Tooltip 
            title="评价标签时，显示“夏普比率＞1.5为优秀”评级标准"
            placement="top"
          >
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' ,cursor: 'pointer' }} onClick={() => navigate('/trend-analysis')}>
            <div style={{ flex: 1 }}>
              <Statistic
                title="夏普比率"
                value={metrics?.sharpeRatio || 0}
                prefix={<LineChartOutlined />}
                precision={2}
                valueStyle={{ color: "#faad14" }}
              />
              <Space style={{ marginTop: 8 }}>
                <Text type="secondary">风险调整后收益</Text>
                <Text
                  type={
                    metrics?.sharpeRatio && metrics.sharpeRatio > 1
                      ? "success"
                      : "warning"
                  }
                >
                  {metrics?.sharpeRatio && metrics.sharpeRatio > 1
                    ? "优秀"
                    : "一般"}
                </Text>
              </Space>
            </div>
          </Card></Tooltip>
        </Col>
        
        <Col xs={5} style={{ display: 'flex' }}>
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' ,cursor: 'pointer' }} onClick={() => navigate('/risk-management')}>
            <div style={{ flex: 1 }}>
              <Statistic
                title="最大回撤"
                value={metrics?.maxDrawdown || 0}
                prefix={<SafetyOutlined />}
                suffix="%"
                precision={1}
                valueStyle={{ color: "#ff4d4f" }}
              />
              <Space style={{ marginTop: 8 }}>
                <Text type="secondary">风险控制</Text>
                <Text
                  type={
                    metrics?.maxDrawdown && metrics.maxDrawdown < 10
                      ? "success"
                      : "danger"
                  }
                >
                  {metrics?.maxDrawdown && metrics.maxDrawdown < 10
                    ? "良好"
                    : "需关注"}
                </Text>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <BarChart3 size={20} />
                  <span>业绩趋势</span>
                </Space>
                <Button 
                  type="text" 
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadPerformanceChart}
                  title="下载图表"
                >
                  
                </Button>
              </div>
            }
          >
            <div id="performance-chart" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    label={{
                      value: "收益率 (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <RechartsTooltip formatter={(value) => [`${value}%`, "收益率"]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="收益率"
                    stroke="#1890ff"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="基准"
                    stroke="#52c41a"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <PieChartOutlined />
                  <span>资产分布</span>
                </Space>
                <Button 
                  type="text" 
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadAllocationChart}
                  title="下载图表"
                >
                  
                </Button>
              </div>
            }
          >
            <div id="allocation-chart" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation.map((item) => ({
                      name: item.category,
                      value: item.value,
                      color: item.color,
                    }))}
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
                  <RechartsTooltip formatter={(value) => [`${value}%`, "占比"]} />
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
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom:
                      index < recentActivities.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {activity.action} {activity.asset}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {activity.time}
                    </Text>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 500 }}>{activity.amount}</div>
                    <Text
                      type={activity.status === "成功" ? "success" : "warning"}
                      style={{ fontSize: 12 }}
                    >
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
                    valueStyle={{ color: "#52c41a", fontSize: 20 }}
                    prefix={<ArrowUpOutlined />}
                    suffix="点"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    +1.2% 今日
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="标普500"
                    value={5123.18}
                    precision={2}
                    valueStyle={{ color: "#ff4d4f", fontSize: 20 }}
                    prefix={<ArrowDownOutlined />}
                    suffix="点"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    -0.8% 今日
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="黄金价格"
                    value={2356.8}
                    precision={2}
                    valueStyle={{ color: "#faad14", fontSize: 20 }}
                    prefix={<ArrowUpOutlined />}
                    suffix="美元/盎司"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    +0.5% 今日
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="美元指数"
                    value={104.32}
                    precision={2}
                    valueStyle={{ color: "#1890ff", fontSize: 20 }}
                    prefix={<ArrowUpOutlined />}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    +0.3% 今日
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
