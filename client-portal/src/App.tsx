import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/store';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { TenantStoreGrid } from './components/dashboard/TenantStoreGrid';
import { StoreCatalogView } from './components/store/StoreCatalogView';
import { StoreCredentialsAuth } from './components/auth/StoreCredentialsAuth';
import { ForcePasswordChange } from './components/auth/ForcePasswordChange';
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
  const { initializing, isAuthenticated, currentUser, loginLoading } = useAppSelector((state) => state.auth);
  const isDark = useAppSelector((state) => state.theme.isDark);

  // Sync dark theme on root html
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // On app load: always try to restore session from cookie
  useEffect(() => {
    if (initializing) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, initializing]);

  // Fetch data when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchStores());
      dispatch(fetchProducts());
      dispatch(fetchOrders());
    }
  }, [isAuthenticated, dispatch]);

  // Live order tracking: poll every 10s when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      dispatch(fetchOrders());
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, dispatch]);

  // Auth guard: redirect to login if not authenticated
  // Skip if we're currently logging in to avoid race conditions
  useEffect(() => {
    if (!initializing && !isAuthenticated && !loginLoading && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [initializing, isAuthenticated, loginLoading, location.pathname, navigate]);

  // If authenticated and on login page, redirect to home
  useEffect(() => {
    if (!initializing && isAuthenticated && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [initializing, isAuthenticated, location.pathname, navigate]);

  // Redirect to force password change if using temporary password
  useEffect(() => {
    if (isAuthenticated && currentUser?.isTemporaryPassword && location.pathname !== '/force-password-change') {
      navigate('/force-password-change', { replace: true });
    }
  }, [isAuthenticated, currentUser, location.pathname, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(setActiveStore(null));
    navigate('/login', { replace: true });
  };

  // Show loading screen while checking auth
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#171c23]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#2988c8] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show only login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#171c23] text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <Routes>
          <Route path="/login" element={<StoreCredentialsAuth onSuccessRedirect={() => navigate('/')} />} />
          <Route path="*" element={<StoreCredentialsAuth onSuccessRedirect={() => navigate('/')} />} />
        </Routes>
        <Footer />
      </div>
    );
  }

  // If using temporary password, show force password change
  if (currentUser?.isTemporaryPassword && location.pathname !== '/force-password-change') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#171c23] text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <Routes>
          <Route path="/force-password-change" element={<ForcePasswordChange />} />
          <Route path="*" element={<ForcePasswordChange />} />
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
          <Route path="/force-password-change" element={<ForcePasswordChange />} />
          <Route path="/store" element={<StoreCatalogView />} />
          <Route path="/orders" element={<OrdersHistoryView />} />
          <Route path="/profile" element={<UserProfileView />} />
          <Route path="*" element={<TenantStoreGrid />} />
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
