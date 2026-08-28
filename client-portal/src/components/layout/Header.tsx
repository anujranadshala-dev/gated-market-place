import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShoppingCart, 
  Sun, 
  Moon, 
  Store as StoreIcon, 
  FileCode, 
  Clock, 
  ChevronDown, 
  LogOut, 
  KeyRound, 
  User as UserIcon, 
  ShoppingBag, 
  Crown, 
  Award, 
  Menu, 
  X, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { toggleTheme } from '../../store/slices/themeSlice';
import { toggleCartDrawer } from '../../store/slices/cartSlice';
import { setActiveStore } from '../../store/slices/tenantSlice';
import { logout } from '../../store/slices/authSlice';
import { getUserGatedTier, GATED_TIERS } from '../../utils/tierUtils';

interface HeaderProps {
  onOpenMagicLinkSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMagicLinkSimulator }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.auth);
  const { stores, activeStoreId } = useAppSelector((state) => state.tenant);
  const { items } = useAppSelector((state) => state.cart);
  const { orders } = useAppSelector((state) => state.order);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalCartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const accessibleStoresCount = currentUser?.accessibleStores?.length || 0;
  const activeStore = stores.find((s) => s.id === activeStoreId);

  // Compute User Spend Tier
  const userGatedTier = getUserGatedTier(currentUser, orders);
  const tierConfig = GATED_TIERS[userGatedTier];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#0b131c]/90 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center space-x-5">
            <button
              onClick={() => {
                dispatch(setActiveStore(null));
                navigate('/');
              }}
              className="flex items-center space-x-3 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#e67e22] flex items-center justify-center text-white shadow-sm ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-200">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                    Nexus<span className="text-[#e67e22]">Gate</span>
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-[#e67e22]/10 text-[#e67e22] dark:text-amber-400 border border-[#e67e22]/25">
                    PORTAL
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                  Verified Store Directory
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  dispatch(setActiveStore(null));
                  navigate('/');
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95 ${
                  location.pathname === '/'
                    ? 'text-white bg-[#0f172a] dark:bg-[#e67e22] shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <StoreIcon className="w-4 h-4" />
                <span>Invited Stores</span>
                <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  location.pathname === '/' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {accessibleStoresCount}
                </span>
              </button>

              {activeStore && (
                <button
                  onClick={() => navigate('/store')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95 ${
                    location.pathname === '/store'
                      ? 'text-white bg-[#0f172a] dark:bg-[#e67e22] shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="truncate max-w-[130px]">{activeStore.name}</span>
                </button>
              )}

              <button
                onClick={() => navigate('/orders')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95 ${
                  location.pathname === '/orders'
                    ? 'text-white bg-[#0f172a] dark:bg-[#e67e22] shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Orders</span>
                {orders.some((o) => o.status === 'Pending') && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#e67e22] text-white animate-subtle-pulse">
                    {orders.filter((o) => o.status === 'Pending').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/profile')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95 ${
                  location.pathname === '/profile'
                    ? 'text-white bg-[#0f172a] dark:bg-[#e67e22] shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile & Tier</span>
              </button>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2">

            {/* Dark/Light Mode Toggle Button */}
            <button
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle light and dark mode"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => dispatch(toggleCartDrawer())}
              className="relative flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white shadow-sm transition-all duration-150 cursor-pointer active:scale-95 font-bold text-xs"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalCartCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black leading-none text-slate-900 bg-amber-300 rounded-full shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Profile & Tier Status */}
            {isAuthenticated && currentUser ? (
              <div className="relative flex items-center space-x-1.5">
                
                {/* Shopper Tier Pill */}
                <button
                  onClick={() => navigate('/profile')}
                  className={`hidden sm:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${tierConfig.badgeClass} shadow-xs border cursor-pointer hover:opacity-90 active:scale-95 transition-all`}
                  title={`Your Spend Tier is ${userGatedTier} (${tierConfig.discountPercent}% Discount). Click to view breakdown.`}
                >
                  <span>{tierConfig.icon}</span>
                  <span>{userGatedTier} ({tierConfig.discountPercent}%)</span>
                </button>

                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-[#e67e22]/50"
                  />
                  <div className="hidden xl:block text-left text-xs">
                    <p className="font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[110px]">
                      {currentUser.fullName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                      @{currentUser.username || 'shopper'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-11 mt-2 w-72 rounded-2xl bg-white dark:bg-[#0b131c] border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {currentUser.fullName}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${tierConfig.badgeClass}`}>
                          {tierConfig.icon} {userGatedTier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        @{currentUser.username} • {currentUser.email}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Total Spend:</span>
                        <span className="font-mono font-bold text-[#e67e22]">
                          ${((currentUser.totalSpent || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-2 text-xs border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Cart Discount:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {tierConfig.discountPercent}% Off Every Order
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Shipping Perk:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                          {tierConfig.shippingPerk}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 space-y-0.5">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>Spend Tiers & Offers</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/orders');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#e67e22]" />
                        <span>Purchase Order History</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenMagicLinkSimulator();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                        <span>Shopper Login Credentials</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          dispatch(logout());
                          navigate('/login');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-3.5 py-1.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 md:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b131c] px-4 py-3 space-y-2 animate-in slide-in-from-top-1">
          <button
            onClick={() => {
              dispatch(setActiveStore(null));
              navigate('/');
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-white"
          >
            <div className="flex items-center space-x-2">
              <StoreIcon className="w-4 h-4 text-[#e67e22]" />
              <span>Invited Stores</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#e67e22]/15 text-[#e67e22] text-[10px] font-bold">
              {accessibleStoresCount} Stores
            </span>
          </button>

          {activeStore && (
            <button
              onClick={() => {
                navigate('/store');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-white"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active: {activeStore.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          <button
            onClick={() => {
              navigate('/orders');
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-white"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#e67e22]" />
              <span>Orders & Tracking</span>
            </div>
            {orders.length > 0 && (
              <span className="text-[10px] text-slate-400 font-mono">
                {orders.length} orders
              </span>
            )}
          </button>

          <button
            onClick={() => {
              navigate('/profile');
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-white"
          >
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-[#e67e22]" />
              <span>Profile & Spend Tier</span>
            </div>
            <span className="text-[10px] text-amber-500 font-bold">
              {userGatedTier} ({tierConfig.discountPercent}% Off)
            </span>
          </button>
        </div>
      )}
    </header>
  );
};