import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './services/authService'
import LoginPage from './pages/LoginPage'
import MainLayout from './components/Layout/MainLayout'
import DashboardPage from './pages/DashboardPage'
import DataGridPage from './pages/DataGridPage'
import ChartsAnalysisPage from './pages/ChartsAnalysisPage'
import RiskManagementPage from './pages/RiskManagementPage'
import AssetDetailPage from './pages/AssetDetailPage'
import TrendAnalysisPage from './pages/TrendAnalysisPage'
import AssetDistributionPage from './pages/AssetDistributionPage'
import IndustryAnalysisPage from './pages/IndustryAnalysisPage'

// 投资组合页面组件
const PortfolioPage = () => (
  <div style={{ padding: 24 }}>
    <h1>投资组合管理</h1>
    <p>管理投资组合配置、再平衡、业绩归因等功能。</p>
    <p>提供投资组合优化工具和策略回测。</p>
  </div>
)

// 合规监控页面组件
const CompliancePage = () => (
  <div style={{ padding: 24 }}>
    <h1>合规监控</h1>
    <p>监控投资组合的合规性，包括投资限制、监管要求、内部政策等。</p>
    <p>提供合规报告和预警功能。</p>
  </div>
)

// 受保护路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="data-grid" element={<DataGridPage />} />
          <Route path="charts-analysis" element={<ChartsAnalysisPage />} />
          <Route path="risk-management" element={<RiskManagementPage />} />
          <Route path="trend-analysis" element={<TrendAnalysisPage />} />
          <Route path="asset-distribution" element={<AssetDistributionPage />} />
          <Route path="industry-analysis" element={<IndustryAnalysisPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="asset/:id" element={<AssetDetailPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
