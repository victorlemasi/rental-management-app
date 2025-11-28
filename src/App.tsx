import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Maintenance from './pages/Maintenance';
import Financials from './pages/Financials';
import TransactionVerification from './pages/TransactionVerification';
import Login from './pages/Login';
import Register from './pages/Register';
import TenantDashboard from './pages/TenantDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
            <Route path="verify-transaction" element={<TransactionVerification />} />
          </Route>

          <Route path="/tenant-dashboard" element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <TenantDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
