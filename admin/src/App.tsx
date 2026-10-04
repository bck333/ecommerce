import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';

import { AdminLoginPage } from './pages/AdminLoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CouponsPage } from './pages/CouponsPage';
import { BannersPage } from './pages/BannersPage';
import { DeliveryAreasPage } from './pages/DeliveryAreasPage';
import { UsersPage } from './pages/UsersPage';

export function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="delivery-areas" element={<DeliveryAreasPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
