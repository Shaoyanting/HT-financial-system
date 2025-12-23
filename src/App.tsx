import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated, getCurrentUser } from './services/authService'
import LoginPage from './pages/LoginPage'
import MainLayout from './components/Layout/MainLayout'
import DashboardPage from './pages/DashboardPage'
import DataGridPage from './pages/DataGridPage'
import ChartsAnalysisPage from './pages/ChartsAnalysisPage'
import RiskManagementPage from './pages/RiskManagementPage'
import AssetDetailPage from './pages/AssetDetailPage'
import TrendAnalysisPage from './pages/TrendAnalysisPage'
import AssetDistributionPage from './pages/AssetDistributionPage'
import ProfilePage from './pages/ProfilePage'



// 受保护路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

// 管理员路由组件
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getCurrentUser()
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
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
          <Route path="risk-management" element={
            <AdminRoute>
              <RiskManagementPage />
            </AdminRoute>
          } />
          <Route path="trend-analysis" element={<TrendAnalysisPage />} />
          <Route path="asset-distribution" element={<AssetDistributionPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="asset/:id" element={<AssetDetailPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
