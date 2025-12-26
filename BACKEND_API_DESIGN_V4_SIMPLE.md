# 金融资产分析系统 - 后端 API 接口设计文档 v4.0（简化版）

## 1. 登录页面接口

### 1.1 用户登录

**POST** `/api/auth/login`
**请求**：

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**：

```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "role": "admin"
  }
}
```

### 1.2 获取用户信息

**GET** `/api/auth/user`
**请求头**：`Authorization: Bearer {token}`
**响应**：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "role": "admin",
    "lastLogin": "2025-12-22 11:45:00"
  }
}
```

## 2. 资产总览页面接口

### 2.1 获取仪表板核心指标

**GET** `/api/dashboard/metrics`
**请求头**：`Authorization: Bearer {token}`
**响应**：

```json
{
  "success": true,
  "data": {
    "totalAssets": 1250000.5,
    "dailyPnL": 12500.25,
    "totalPnL": 250000.75,
    "sharpeRatio": 1.85,
    "maxDrawdown": 12.5,
    "volatility": 0.85,
    "beta": 1.02,
    "alpha": 0.05,
    "winRate": 65.5,
    "avgReturn": 1.25
  }
}
```

### 2.2 获取资产分布数据

**GET** `/api/dashboard/allocation`
**请求头**：`Authorization: Bearer {token}`
**响应**：

```json
{
  "success": true,
  "data": [
    { "category": "股票", "value": 45.5, "color": "#1890ff" },
    { "category": "债券", "value": 25.3, "color": "#52c41a" },
    { "category": "现金", "value": 15.2, "color": "#faad14" },
    { "category": "其他", "value": 14.0, "color": "#f5222d" }
  ]
}
```

### 2.3 获取业绩趋势数据

**GET** `/api/dashboard/performance?range=1y`
**请求头**：`Authorization: Bearer {token}`
**响应**：

```json
{
  "success": true,
  "data": [
    { "date": "2024-01", "portfolio": 100, "benchmark": 100 },
    { "date": "2024-02", "portfolio": 105, "benchmark": 102 },
    { "date": "2024-03", "portfolio": 108, "benchmark": 105 }
  ]
}
```

## 3. 持仓明细页面接口

### 3.1 获取资产列表

**GET** `/api/assets?page=1&size=10&search=&industry=&sortBy=currentPrice&sortOrder=desc`
**请求头**：`Authorization: Bearer {token}`
**响应**：

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "AAPL",
      "name": "苹果公司",
      "currentPrice": 185.25,
      "changePercent": 2.35,
      "marketValue": 2850000000,
      "industry": "科技",
      "position": 15000,
      "costPrice": 175.5,
      "dailyGain": 14625.0,
      "totalGain": 146250.0,
      "weight": 12.5,
      "recordDate": 1736265600000
    },
    {
      "id": 2,
      "code": "MSFT",
      "name": "微软公司",
      "currentPrice": 420.5,
      "changePercent": 1.85,
      "marketValue": 3120000000,
      "industry": "科技",
      "position": 8000,
      "costPrice": 410.25,
      "dailyGain": 8200.0,
      "totalGain": 82000.0,
      "weight": 10.2,
      "recordDate": 1736265600000
    }
  ],
  "pagination": {
    "page": 1,
    "size": 10,
    "total": 50,
    "totalPages": 5
  },
  "stats": {
    "totalMarketValue": 1250000000,
    "totalDailyGain": 125000.5,
    "avgChangePercent": 1.85,
    "count": 50
  }
}
```

### 3.2 获取资产详情

**GET** `/api/assets/{id}`
**请求头**：`Authorization: Bearer {token}`
**响应**：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "AAPL",
    "name": "苹果公司",
    "currentPrice": 185.25,
    "changePercent": 2.35,
    "marketValue": 2850000000,
    "industry": "科技",
    "position": 15000,
    "costPrice": 175.5,
    "dailyGain": 14625.0,
    "totalGain": 146250.0,
    "weight": 12.5,
    "pe": 28.5,
    "pb": 8.2,
    "dividendYield": 0.65,
    "volatility": 0.85,
    "beta": 1.25,
    "sharpeRatio": 1.85,
    "maxDrawdown": 15.2,
    "tend": [
      {
        "id":1,
        "assetId":1,
        "date":2025-01-01,
        "price":100
      },
      {
        "id":1,
        "assetId":1,
        "date":2025-02-01,
        "price":200
      },
    ],
  }
}
```

### 3.3 获取行业筛选选项

**GET** `/api/assets/industries`
**请求头**：`Authorization: Bearer {token}`
**响应**：

```json
{
  "success": true,
  "data": [
    { "value": "科技", "label": "科技", "count": 15 },
    { "value": "金融", "label": "金融", "count": 10 },
    { "value": "消费", "label": "消费", "count": 8 },
    { "value": "医疗", "label": "医疗", "count": 7 },
    { "value": "工业", "label": "工业", "count": 5 }
  ]
}
```

## 4. 风险管理页面接口

### 4.1 获取风险指标

**GET** `/api/risk/metrics`
**响应**：

```json
{
  "success": true,
  "data": {
    "var95": 2.8,
    "cvar95": 4.3,
    "stressTestLoss": 12.5,
    "liquidityRisk": 3.2,
    "concentrationRisk": 18.5,
    "creditRisk": 2.1
  }
}
```

### 4.2 获取回撤数据

**GET** `/api/risk/drawdown?days=365`
**响应**：

```json
{
  "success": true,
  "data": [
    { "date": "2024-12-01", "price": 1250.5, "drawdown": -5.2 },
    { "date": "2024-12-02", "price": 1260.25, "drawdown": -4.8 }
  ]
}
```

### 4.3 获取风险事件

**GET** `/api/risk/events`
**响应**：

```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "type": "市场风险",
      "severity": "高",
      "description": "股市大幅下跌",
      "impact": "-5.2%",
      "status": "已处理"
    }
  ]
}
```

## 5. 趋势分析页面接口

### 5.1 获取投资组合趋势数据

**GET** `/api/trend/portfolio?range=1y`
**响应**：

```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01",
      "portfolio": 100,
      "benchmark": 100,
      "volume": 1200000
    },
    { "date": "2024-02", "portfolio": 105, "benchmark": 102, "volume": 1350000 }
  ]
}
```

### 5.2 获取月度收益数据

**GET** `/api/trend/monthly-returns?range=1y`
**响应**：

```json
{
  "success": true,
  "data": [
    { "month": "1月", "收益": 2.5, "基准": 1.8, "超额": 0.7 },
    { "month": "2月", "收益": 3.2, "基准": 2.1, "超额": 1.1 }
  ]
}
```

### 5.3 获取趋势分析统计指标

**GET** `/api/trend/stats`
**响应**：

```json
{
  "success": true,
  "data": {
    "totalReturn": 35.0,
    "benchmarkReturn": 28.0,
    "alpha": 7.0,
    "beta": 0.95,
    "sharpeRatio": 1.8,
    "informationRatio": 0.9
  }
}
```

## 6. 资产分布页面接口

### 6.1 获取资产配置数据

**GET** `/api/distribution/allocation?category=all&range=current`
**响应**：

```json
{
  "success": true,
  "data": [
    { "category": "股票", "value": 45.5, "color": "#1890ff" },
    { "category": "债券", "value": 25.3, "color": "#52c41a" },
    { "category": "现金", "value": 15.2, "color": "#faad14" }
  ]
}
```

### 6.2 获取历史配置变化数据

**GET** `/api/distribution/historical`
**响应**：

```json
{
  "success": true,
  "data": [
    { "date": "2024-01", "股票": 62.5, "债券": 28.5, "现金": 9.0 },
    { "date": "2024-02", "股票": 63.2, "债券": 27.8, "现金": 9.0 }
  ]
}
```

### 6.3 获取资产分布统计指标

**GET** `/api/distribution/stats`
**响应**：

```json
{
  "success": true,
  "data": {
    "totalAssets": 125000000,
    "stockPercentage": 65.5,
    "bondPercentage": 25.3,
    "cashPercentage": 9.2,
    "topIndustry": "科技",
    "topIndustryPercentage": 32.8,
    "diversificationScore": 8.5
  }
}
```

## 7. 接口调用示例

### 8.1 登录示例

```javascript
const login = async (username, password) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return await response.json();
};
```

### 8.2 获取资产总览数据

```javascript
const fetchDashboardData = async (token) => {
  const [metrics, allocation, performance] = await Promise.all([
    fetch("/api/dashboard/metrics", {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch("/api/dashboard/allocation", {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch("/api/dashboard/performance?range=1y", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);
  return {
    metrics: await metrics.json(),
    allocation: await allocation.json(),
    performance: await performance.json(),
  };
};
```

### 8.3 获取持仓明细数据

```javascript
const fetchAssetsData = async (
  token,
  page = 1,
  size = 10,
  search = "",
  industry = ""
) => {
  const [assets, industries] = await Promise.all([
    fetch(
      `/api/assets?page=${page}&size=${size}&search=${search}&industry=${industry}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ),
    fetch("/api/assets/industries", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);
  return {
    assets: await assets.json(),
    industries: await industries.json(),
  };
};
```

### 8.4 获取风险管理数据

```javascript
const fetchRiskData = async (token) => {
  const [metrics, drawdown, events] = await Promise.all([
    fetch("/api/risk/metrics", {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch("/api/risk/drawdown?days=365", {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch("/api/risk/events", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);
  return {
    metrics: await metrics.json(),
    drawdown: await drawdown.json(),
    events: await events.json(),
  };
};
```

### 8.5 获取趋势分析数据

```javascript
const fetchTrendData = async (token, range = "1y") => {
  const [portfolio, monthlyReturns, stats] = await Promise.all([
    fetch(`/api/trend/portfolio?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`/api/trend/monthly-returns?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch("/api/trend/stats", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);
  return {
    portfolio: await portfolio.json(),
    monthlyReturns: await monthlyReturns.json(),
    stats: await stats.json(),
  };
};
```

### 8.6 获取资产分布数据

```javascript
const fetchDistributionData = async (
  token,
  category = "all",
  range = "current"
) => {
  const [allocation, historical, stats] = await Promise.all([
    fetch(`/api/distribution/allocation?category=${category}&range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch("/api/distribution/historical", {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch("/api/distribution/stats", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);
  return {
    allocation: await allocation.json(),
    historical: await historical.json(),
    stats: await stats.json(),
  };
};
```

## 8. 技术规范（简化）

### 9.1 认证

- 使用 JWT 令牌
- 令牌有效期：24 小时
- 请求头：`Authorization: Bearer {token}`

### 9.2 响应格式

```json
{
  "success": true/false,
  "message": "描述信息",
  "data": {}
}
```

### 9.3 错误处理

- 400：参数错误
- 401：未授权
- 404：资源不存在
- 500：服务器错误

### 9.4 分页参数

- page：页码（从 1 开始）
- size：每页数量（默认 10）
- sortBy：排序字段
- sortOrder：排序方向（asc/desc）

## 9. 模拟数据规则

### 10.1 数值范围

- 百分比：0-100
- 收益率：-20%到+50%
- 波动率：5%-30%
- 夏普比率：0-3

### 10.2 颜色分配

- 股票：#1890ff（蓝色）
- 债券：#52c41a（绿色）
- 现金：#faad14（黄色）
- 科技：#1890ff
- 金融：#52c41a
- 消费：#faad14

### 10.3 时间序列

- 日期格式：YYYY-MM 或 YYYY-MM-DD
- 按时间范围生成不同粒度的数据

## 10. 部署配置

### 11.1 开发环境

- 后端端口：8080
- 前端端口：5173
- 跨域：允许所有来源

### 11.2 前端代理配置（vite.config.ts）

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    }
  }
}
```

### 11.3 快速启动

```bash
# 后端启动
java -jar financial-backend.jar

# 前端启动
npm run dev
```

---

**文档版本**：v4.1  
**更新日期**：2025-12-23  
**更新内容**：删除行业分析页面接口，更新文档结构
