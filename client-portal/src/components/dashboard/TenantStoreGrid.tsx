import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store as StoreIcon, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Building2, 
  Clock, 
  Percent, 
  KeyRound, 
  CheckCircle2, 
  Tag,
  ShieldAlert,
  Crown,
  Lock,
  Zap,
  Award,
  TrendingUp,
  Plus
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setActiveStore } from '../../store/slices/tenantSlice';
import { redeemInviteCode, simulateAddSpend } from '../../store/slices/authSlice';
import { 
  getUserGatedTier, 
  getTierProgress, 
  GATED_TIERS 
} from '../../utils/tierUtils';
import { VipBlackModal } from '../auth/VipBlackModal';
import { Store } from '../../types';
import confetti from 'canvas-confetti';

export const TenantStoreGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { stores } = useAppSelector((state) => state.tenant);
  const { orders } = useAppSelector((state) => state.order);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  const userGatedTier = getUserGatedTier(currentUser, orders);
  const tierConfig = GATED_TIERS[userGatedTier];
  const tierProgress = getTierProgress(currentUser, orders);

  const invitedStoresCount = stores.filter((st) => 
    currentUser?.accessibleStores?.includes(st.id) || currentUser?.isVipBlackSubscribed
  ).length;

  const categories = ['ALL', ...Array.from(new Set(stores.map((s) => s.category)))];

  const handleOpenStore = (store: Store) => {
    const isInvited = currentUser?.accessibleStores?.includes(store.id) || currentUser?.isVipBlackSubscribed;
    if (!isInvited) {
      setIsInviteModalOpen(true);
      return;
    }
    dispatch(setActiveStore(store.id));
    navigate('/store');
  };

  const handleSimulateSpend = (amount: number) => {
    dispatch(simulateAddSpend(amount));
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}
  };

  const handleRedeemInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const code = inviteCodeInput.trim().toUpperCase();
    
    // Check available invitation tokens
    if (
      code === 'NEXUS-VIP-2026' || 
      code === 'AERO-DEF-900' || 
      code === 'BIO-CLINICAL-100' ||
      code === 'VERDANT-GO-777' ||
      code === 'LUMINA-PRO-555' ||
      code === 'BLACK-RESERVE-999'
    ) {
      const targetStoreId = code.includes('AERO') 
        ? 'store_aerovanguard' 
        : code.includes('BIO') 
        ? 'store_biovance_pharma' 
        : code.includes('VERDANT')
        ? 'store_verdant_agritech'
        : code.includes('LUMINA')
        ? 'store_lumina_photonics'
        : code.includes('BLACK')
        ? 'store_black_reserve'
        : 'store_nexus_robotics';

      dispatch(redeemInviteCode({ inviteCode: code, storeId: targetStoreId }));
      setInviteSuccess(true);
      setInviteError('');
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteSuccess(false);
        setInviteCodeInput('');
      }, 1000);
    } else {
      setInviteError('Invalid token code. Active demo keys: NEXUS-VIP-2026, AERO-DEF-900, BIO-CLINICAL-100, VERDANT-GO-777, LUMINA-PRO-555, BLACK-RESERVE-999');
    }
  };

  // Filter stores according to search, category, and selected tab
  const filteredStores = stores.filter((st) => {
    const isInvited = currentUser?.accessibleStores?.includes(st.id) || currentUser?.isVipBlackSubscribed;
    
    // if (filterTab === 'invited' && !isInvited) return false;
    if (selectedCategory !== 'ALL' && st.category !== selectedCategory) return false;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      st.name.toLowerCase().includes(term) ||
      st.category.toLowerCase().includes(term) ||
      st.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Modern Shopper Tier & Spend Dashboard Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-[#0b131c] via-[#16212e] to-[#0b131c] text-white p-6 sm:p-8 shadow-xl">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Column: Current Tier & Status */}
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${tierConfig.badgeClass} shadow-md border`}>
                <span>{tierConfig.icon}</span>
                <span>{tierConfig.badge}</span>
              </span>

              {userGatedTier === 'VIP Black' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>VIP Pass Active</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/10 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>Earned from Lifetime Spend</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Shopper Status: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-orange-400">{userGatedTier}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Welcome, <strong className="text-white">{currentUser?.fullName}</strong> (@{currentUser?.username}). You have access to <strong>{invitedStoresCount} authorized {invitedStoresCount === 1 ? 'store' : 'stores'}</strong>.
            </p>

            {/* Perks Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-amber-300 flex items-center space-x-1.5">
                <Percent className="w-3.5 h-3.5" />
                <span><strong>{tierConfig.discountPercent}%</strong> Auto-Applied Cart Discount</span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{tierConfig.shippingPerk}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Spend Meter & Simulation */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 lg:w-96 space-y-4 shadow-xl">
            
            {/* Lifetime Spend & Progress */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Lifetime Spend:
                </span>
                <span className="text-lg font-mono font-extrabold text-white">
                  ${tierProgress.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Progress Bar */}
              {!tierProgress.isMaxSpendTier && !tierProgress.isVipBlack ? (
                <div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 border border-slate-700 overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, tierProgress.progressPercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] mt-1.5 text-slate-400">
                    <span>{tierProgress.currentTier} (${tierProgress.minSpendRequired})</span>
                    <span className="font-bold text-amber-300">
                      Spend ${tierProgress.remainingSpend.toFixed(2)} more for {tierProgress.nextTier}
                    </span>
                    <span>{tierProgress.nextTier} (${tierProgress.targetSpend})</span>
                  </div>
                </div>
              ) : tierProgress.isVipBlack ? (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 font-bold">
                    <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>VIP Black Pass Active</span>
                  </span>
                  <span className="text-[11px] text-amber-200">15% Max Off Across All Stores</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 font-bold">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Top Spend Tier Achieved (Gold - 10% Off)</span>
                  </span>
                </div>
              )}
            </div>

            {/* Quick Demo Spend Actions */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">Quick Test Spend (Simulate Orders):</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSimulateSpend(250)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3 h-3 text-amber-400" />
                  <span>+$250</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateSpend(1000)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3 h-3 text-amber-400" />
                  <span>+$1,000</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateSpend(2500)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3 h-3 text-amber-400" />
                  <span>+$2,500</span>
                </button>
              </div>

              {/* VIP Black Subscription CTA */}
              {!currentUser?.isVipBlackSubscribed ? (
                <button
                  type="button"
                  onClick={() => setIsVipModalOpen(true)}
                  className="w-full mt-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-extrabold transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98"
                >
                  <Crown className="w-4 h-4 fill-slate-950" />
                  <span>Upgrade to VIP Black (15% Off All Stores)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsVipModalOpen(true)}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manage VIP Black Membership</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* 2. Filter Tabs & Search & Redeem Token */}
      <div className="space-y-4">
        
        {/* User Identity & Store Invitation Access Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#e67e22]/10 text-[#e67e22] flex items-center justify-center font-bold text-base shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Invited Shopper:
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold border border-slate-200 dark:border-slate-700">
                  @{currentUser?.username || 'shopper'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {invitedStoresCount} {invitedStoresCount === 1 ? 'Store' : 'Stores'} Authorized
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select any authorized store below to explore inventory, prices, and place purchase orders.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer active:scale-98"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Redeem Store Invite Code</span>
            </button>
          </div>
        </div>

        {/* Tab Controls & Category Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Main Tabs */}
          {/* <div className="flex items-center space-x-1.5 bg-white dark:bg-[#0f172a] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"> */}
            <span
              // onClick={() => setFilterTab('invited')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 ${
                // filterTab === 'invited'
                   'bg-[#0f172a] text-white dark:bg-[#e67e22] dark:text-white shadow-xs'
                  // : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Invited Stores ({invitedStoresCount})</span>
            </span>
{/* 
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-[#0f172a] text-white dark:bg-[#e67e22] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>All Stores ({stores.length})</span>
            </button> */}
          {/* </div> */}

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stores or industries..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-[#e67e22] focus:outline-none shadow-xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-[#0f172a] text-white dark:bg-[#e67e22] dark:text-white shadow-xs'
                  : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Industries' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* 3. Stores Grid */}
      {filteredStores.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-[#e67e22] mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Stores Matching Your Filters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try resetting your search query or switching to "All Stores" to explore other catalogs.
          </p>
          {/* <span
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
              setFilterTab('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </span> */}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => {
            const isInvited = currentUser?.accessibleStores?.includes(store.id) || currentUser?.isVipBlackSubscribed;

            return (
              <div
                key={store.id}
                onClick={() => handleOpenStore(store)}
                className={`group rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isInvited
                    ? 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 hover:border-[#e67e22] dark:hover:border-[#e67e22] shadow-sm hover:shadow-xl'
                    : 'bg-slate-50/70 dark:bg-[#111827] border-slate-200 dark:border-slate-800/80 opacity-85 hover:opacity-100 hover:border-amber-400'
                }`}
              >
                <div>
                  {/* Banner Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={store.bannerUrl}
                      alt={store.name}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        !isInvited ? 'grayscale-[20%] brightness-90' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

                    {/* Top Tier Benefit / Invitation Badge */}
                    <div className="absolute top-3 left-3">
                      {isInvited ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600/90 text-white shadow-md backdrop-blur-xs border border-emerald-400/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Invited Store</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800/90 text-slate-200 shadow-md backdrop-blur-xs border border-slate-600">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Invite Code Required</span>
                        </span>
                      )}
                    </div>

                    {/* Tier Discount Pill */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${tierConfig.badgeClass} shadow-md border`}>
                        <span>{tierConfig.icon}</span>
                        <span>{tierConfig.discountPercent}% Tier Offer</span>
                      </span>
                    </div>

                    {/* Category on Banner */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold text-white/90 bg-black/50 backdrop-blur-xs border border-white/20">
                        {store.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-start space-x-3 mb-3">
                      <img
                        src={store.logoUrl}
                        alt={store.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-md -mt-8 shrink-0 bg-white dark:bg-slate-900"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug group-hover:text-[#e67e22] transition-colors">
                          {store.name}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                          {store.totalProductsCount} Precision Products • Tax: {(store.taxDefaultRate * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                      {store.description}
                    </p>

                    {/* Access Condition Box */}
                    {!isInvited ? (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 space-y-1 mb-2">
                        <div className="flex items-center space-x-1.5 font-bold">
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Not in your invited stores list</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                          Enter your store invitation token or sign in with an authorized shopper account to access this store.
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between mb-2">
                        <span className="flex items-center space-x-1 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Access Granted • {userGatedTier} Shopper</span>
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          {tierConfig.discountPercent}% Discount
                        </span>
                      </div>
                    )}

                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0">
                  {isInvited ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenStore(store);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0f172a] hover:bg-[#e67e22] dark:bg-[#1e293b] dark:hover:bg-[#e67e22] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer group-hover:shadow-md active:scale-98"
                    >
                      <StoreIcon className="w-4 h-4" />
                      <span>Enter Store & View Products</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsInviteModalOpen(true);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#e67e22]" />
                      <span>Redeem Invite Code to Unlock</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. Redeem Token Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#e67e22] text-white flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Redeem Store Invite Token
                </h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              Enter the single-use token or invitation code provided by your organization or vendor.
            </p>

            <form onSubmit={handleRedeemInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Invitation Token:
                </label>
                <input
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  placeholder="e.g. AERO-DEF-900"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#e67e22] focus:outline-none"
                  autoFocus
                />
              </div>

              {inviteError && (
                <p className="text-xs text-rose-500 font-medium">
                  {inviteError}
                </p>
              )}

              {inviteSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Store access granted successfully!</span>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
                <p className="font-bold text-slate-700 dark:text-slate-300">Active Demo Store Invite Keys (Click to Fill):</p>
                <div className="flex flex-wrap gap-1.5 pt-1 font-mono">
                  <button
                    type="button"
                    onClick={() => setInviteCodeInput('AERO-DEF-900')}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#e67e22] text-[#e67e22] cursor-pointer"
                  >
                    AERO-DEF-900 (AeroVanguard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteCodeInput('BIO-CLINICAL-100')}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#e67e22] text-[#e67e22] cursor-pointer"
                  >
                    BIO-CLINICAL-100 (BioVance)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteCodeInput('NEXUS-VIP-2026')}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#e67e22] text-[#e67e22] cursor-pointer"
                  >
                    NEXUS-VIP-2026 (Nexus Robotics)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteCodeInput('VERDANT-GO-777')}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#e67e22] text-[#e67e22] cursor-pointer"
                  >
                    VERDANT-GO-777 (Verdant Agritech)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteCodeInput('LUMINA-PRO-555')}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#e67e22] text-[#e67e22] cursor-pointer"
                  >
                    LUMINA-PRO-555 (Lumina Photonics)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteCodeInput('BLACK-RESERVE-999')}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-amber-400 text-amber-500 cursor-pointer"
                  >
                    BLACK-RESERVE-999 (Apex Black)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Verify & Redeem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VIP Black Subscription Modal */}
      <VipBlackModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
      />

    </div>
  );
};
