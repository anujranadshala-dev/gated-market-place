import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/store';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { TenantStoreGrid } from './components/dashboard/TenantStoreGrid';
import { StoreCatalogView } from './components/store/StoreCatalogView';
import { StoreCredentialsAuth } from './components/auth/StoreCredentialsAuth';
import { OrdersHistoryView } from './components/orders/OrdersHistoryView';
import { UserProfileView } from './components/profile/UserProfileView';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderTrackingModal } from './components/orders/OrderTrackingModal';
import { setActiveStore } from './store/slices/tenantSlice';
import { fetchCurrentUser, logout } from './store/slices/authSlice';
import { fetchStores, fetchProducts } from './store/slices/tenantSlice';
import { fetchOrders } from './store/slices/orderSlice';

export default function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.auth);
  const isDark = useAppSelector((state) => state.theme.isDark);

  // Sync dark theme on root html
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Fetch current user and data on app load
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Fetch data when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchStores());
      dispatch(fetchProducts());
      dispatch(fetchOrders());
    }
  }, [isAuthenticated, dispatch]);

  // Redirect to login if not authenticated (except on login page)
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(setActiveStore(null));
    navigate('/login');
  };

  // If not authenticated and on login page, show login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#171c23] text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <Routes>
          <Route path="/login" element={<StoreCredentialsAuth onSuccessRedirect={() => navigate('/')} />} />
        </Routes>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#171c23] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Main Header with Theme & Cart Controls */}
      <Header />

      {/* Main Body Dynamic View Router */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<TenantStoreGrid />} />
          <Route path="/login" element={<StoreCredentialsAuth onSuccessRedirect={() => navigate('/')} />} />
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
