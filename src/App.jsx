import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Overview from './pages/Overview'
import DailyChecks from './pages/DailyChecks'
import MonthlyAudit from './pages/MonthlyAudit'
import AnnualChecks from './pages/AnnualChecks'
import AlertsPage from './pages/AlertsPage'
import Configuration from './pages/Configuration'
import { DataProvider } from './context/DataContext'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <DataProvider isMock={false}><Layout /></DataProvider>
            </ProtectedRoute>
          }>
            <Route index element={<Overview />} />
            <Route path="daily" element={<DailyChecks />} />
            <Route path="monthly" element={<MonthlyAudit />} />
            <Route path="annual" element={<AnnualChecks />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="config" element={<Configuration />} />
          </Route>

          <Route path="/mock" element={
            <ProtectedRoute>
              <DataProvider isMock={true}><Layout basePath="/mock" /></DataProvider>
            </ProtectedRoute>
          }>
            <Route index element={<Overview />} />
            <Route path="daily" element={<DailyChecks />} />
            <Route path="monthly" element={<MonthlyAudit />} />
            <Route path="annual" element={<AnnualChecks />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="config" element={<Configuration />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
