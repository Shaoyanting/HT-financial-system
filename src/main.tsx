import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import './index.css'
import App from './App.tsx'

// 配置antd主题为深蓝色
const theme = {
  token: {
    colorPrimary: '#1890ff', // 深蓝色
    borderRadius: 6,
    colorBgContainer: '#ffffff',
    colorBorderSecondary: '#f0f0f0',
    colorText: 'rgba(0, 0, 0, 0.85)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
    colorBgLayout: '#f0f2f5',
    fontSize: 14,
    lineHeight: 1.5,
  },
  components: {
    Layout: {
      headerBg: '#001529',
      headerColor: '#ffffff',
      siderBg: '#001529',
      triggerBg: '#002140',
      triggerColor: '#ffffff',
    },
    Card: {
      borderRadiusLG: 8,
      boxShadowTertiary: '0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)',
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: 'rgba(0, 0, 0, 0.85)',
      rowHoverBg: '#fafafa',
      borderColor: '#f0f0f0',
    },
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN} theme={theme}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)
