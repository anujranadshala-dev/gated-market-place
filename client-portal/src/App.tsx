import React, { useEffect, useState } from 'react';
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
import { ArchitectureModal } from './components/architecture/ArchitectureModal';
import { setCurrentView } from './store/slices/tenantSlice';

export default function App() {
  const dispatch = useAppDispatch();
  const { currentView } = useAppSelector((state) => state.tenant);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isDark = useAppSelector((state) => state.theme.isDark);

  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

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
      dispatch(setCurrentView('magic_link_auth'));
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#121921] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Interactive Demo Persona Switcher */}
      <RoleSwitcherBar />

      {/* Main Header with Theme & Cart Controls */}
      <Header
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenMagicLinkSimulator={() => dispatch(setCurrentView('magic_link_auth'))}
      />

      {/* Main Body Dynamic View Router */}
      <main className="flex-1">
        {currentView === 'dashboard' && <TenantStoreGrid />}
        {currentView === 'store_catalog' && <StoreCatalogView />}
        {currentView === 'magic_link_auth' && (
          <MagicLinkHandler onSuccessRedirect={() => dispatch(setCurrentView('dashboard'))} />
        )}
        {currentView === 'orders_history' && <OrdersHistoryView />}
        {currentView === 'profile' && <UserProfileView />}
      </main>

      {/* Global Redux Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      
      {/* Full-Stack Architecture Blueprint Inspector */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Corporate Footer */}
      <Footer onOpenArchitecture={() => setIsArchitectureOpen(true)} />
    </div>
  );
}
