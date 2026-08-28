import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/store';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { RoleSwitcherBar } from './components/auth/RoleSwitcherBar';
import { TenantStoreGrid } from './components/dashboard/TenantStoreGrid';
import { StoreCatalogView } from './components/store/StoreCatalogView';
import { MagicLinkHandler } from './components/auth/MagicLinkHandler';
import { OrdersHistoryView } from './components/orders/OrdersHistoryView';
import { UserProfileView } from './components/profile/UserProfileView';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderTrackingModal } from './components/orders/OrderTrackingModal';
import { setActiveStore } from './store/slices/tenantSlice';

export default function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const location = useLocation();
  const navigate = useNavigate();


  // Sync dark theme on root html
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Check for incoming ?token= URL parameter on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#171c23] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Interactive Demo Persona Switcher */}
      <RoleSwitcherBar />

      {/* Main Header with Theme & Cart Controls */}
      <Header
        onOpenMagicLinkSimulator={() => navigate('/login')}
      />

      {/* Main Body Dynamic View Router */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<TenantStoreGrid />} />
          <Route path="/login" element={<MagicLinkHandler onSuccessRedirect={() => navigate('/')} />} />
          <Route path="/store" element={<StoreCatalogView />} />
          <Route path="/orders" element={<OrdersHistoryView />} />
          <Route path="/profile" element={<UserProfileView />} />
        </Routes>
      </main>

      {/* Global Redux Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />

      {/* Corporate Footer */}
      <Footer />
    </div>
  );
}
