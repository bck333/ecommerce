import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { LoginModal } from './components/LoginModal';
import { LocationModal } from './components/LocationModal';
import { VoiceAssistantFAB } from './components/VoiceAssistantFAB';

import { HomePage } from './pages/HomePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AddressesPage } from './pages/AddressesPage';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-[#f4f6fb] text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
              <Header />

              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/addresses" element={<AddressesPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />

              {/* Global Overlays */}
              <CartDrawer />
              <LoginModal />
              <LocationModal />
              <VoiceAssistantFAB />
            </div>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
