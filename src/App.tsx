import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Maintenance from './pages/Maintenance';
import Financials from './pages/Financials';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import TransactionVerification from './pages/TransactionVerification';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TenantRentPage from './pages/TenantRentPage';
import TenantLeasePage from './pages/TenantLeasePage';
import TenantMaintenancePage from './pages/TenantMaintenancePage';
import TenantPaymentPage from './pages/TenantPaymentPage';
import TenantNotificationsPage from './pages/TenantNotificationsPage';
import { TenantDataWrapper } from './components/TenantDataWrapper';
import Settings from './pages/Settings';
import DebugTenantData from './pages/DebugTenantData';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/" element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="properties" element={<Properties />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="financials" element={<Financials />} />
              <Route path="payments" element={<Payments />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="verify-transaction" element={<TransactionVerification />} />
            </Route>

            <Route path="/tenant-dashboard" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route element={<TenantDataWrapper />}>
                <Route index element={<TenantRentPage />} />
                <Route path="lease" element={<TenantLeasePage />} />
                <Route path="maintenance" element={<TenantMaintenancePage />} />
                <Route path="payments" element={<TenantPaymentPage />} />
                <Route path="notifications" element={<TenantNotificationsPage />} />
              </Route>
            </Route>

            <Route path="/debug-tenant" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <DebugTenantData />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
