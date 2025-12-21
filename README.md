# 金融资产数据分析及展示系统

一个基于 React 的金融资产数据分析及展示系统，实现金融数据的可视化展示和分析。

## 技术栈

- **框架**: React (函数组件和 Hooks)
- **语言**: TypeScript
- **UI 库**: antd (主题色为深蓝色)
- **图标**: Lucide React
- **可视化图表**: Recharts
- **数据表格**: @tanstack/react-table
- **状态管理**: useReducer Hook
- **构建工具**: Vite
- **模拟数据**: mockjs

## 项目结构

```
src/
├── components/          # 通用组件
│   └── Layout/         # 布局组件
├── pages/              # 页面组件
│   ├── LoginPage.tsx   # 登录页面
│   ├── DashboardPage.tsx # 数据看板页面
│   └── ...             # 其他页面
├── utils/              # 工具函数
│   └── formatters.ts   # 格式化工具
├── services/           # API服务
│   ├── mockData.ts     # 模拟数据
│   ├── authService.ts  # 认证服务
│   └── dataService.ts  # 数据服务
├── assets/             # 静态资源
├── App.tsx             # 主应用
└── index.js            # 入口文件
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 演示账户

系统提供两个演示账户：

1. **管理员账户**

   - 用户名: `admin`
   - 密码: `admin123`

2. **普通用户账户**
   - 用户名: `user1`
   - 密码: `user123`

