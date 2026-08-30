import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  ShoppingCart, 
  Percent, 
  Clock, 
  Sparkles, 
  Check, 
  Eye, 
  Plus, 
  Tag, 
  Building2, 
  AlertTriangle, 
  ArrowRight,
  Crown,
  KeyRound,
  Store as StoreIcon,
  Copy,
  ChevronDown
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setActiveStore, setSelectedProductId } from '../../store/slices/tenantSlice';
import { addItemToCart, toggleCartDrawer } from '../../store/slices/cartSlice';
import { getUserGatedTier, GATED_TIERS } from '../../utils/tierUtils';
import { ProductDetailModal } from './ProductDetailModal';
import { VipBlackModal } from '../auth/VipBlackModal';
import { Product, Store } from '../../types';

export const StoreCatalogView: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stores, products, activeStoreId, selectedProductId } = useAppSelector((state) => state.tenant);
  const { currentUser } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.order);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'lead_time'>('featured');
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const currentStore: Store = stores.find((s) => s.id === activeStoreId) || stores[0];
  
  // User Spend Tier
  const userGatedTier = getUserGatedTier(currentUser, orders);
  const tierConfig = GATED_TIERS[userGatedTier];
  
  // Check authorization
  const isInvited = currentUser?.accessibleStores?.includes(currentStore.id) || currentUser?.isVipBlackSubscribed;
  const userAccessibleStores = stores.filter(s => currentUser?.accessibleStores?.includes(s.id) || currentUser?.isVipBlackSubscribed);

  // Products for active store
  const storeProducts = products.filter((p) => p.storeId === currentStore.id);

  // Category listing
  const categories = ['ALL', ...Array.from(new Set(storeProducts.map((p) => p.category)))];

  // Filtering & Sorting
  const filteredProducts = storeProducts
    .filter((p) => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchQuery = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.basePrice - b.basePrice;
      if (sortBy === 'price_high') return b.basePrice - a.basePrice;
      if (sortBy === 'lead_time') return a.leadTimeDays - b.leadTimeDays;
      return 0; // featured
    });

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(addItemToCart({ product, quantity: product.moq || 1 }));
    setQuickAddedId(product.id);
    setTimeout(() => {
      setQuickAddedId(null);
    }, 1200);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  // If user lands on an uninvited store
  if (!isInvited) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-in fade-in duration-200">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#212832] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-[#2988c8] flex items-center justify-center mx-auto ring-8 ring-amber-500/10">
            <KeyRound className="w-8 h-8" />
          </div>
          
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Store Invitation Required</span>
          </span>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Invitation Required for {currentStore.name}
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            You are logged in as <strong>@{currentUser?.username}</strong> ({userGatedTier} Shopper). To access this store, you need an authorized store invitation token or an active VIP Black Pass.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                dispatch(setActiveStore(null));
                navigate('/');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Return to Store Directory
            </button>

            <button
              onClick={() => setIsVipModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-extrabold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>Unlock with VIP Black Pass</span>
            </button>
          </div>
        </div>

        <VipBlackModal
          isOpen={isVipModalOpen}
          onClose={() => setIsVipModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Quick Navigation Bar & Store Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              dispatch(setActiveStore(null));
              navigate('/');
            }}
            className="p-2 rounded-xl bg-white dark:bg-[#212832] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#2988c8] dark:hover:text-[#2988c8] hover:border-[#2988c8] transition-all cursor-pointer shadow-xs active:scale-95 flex items-center space-x-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Store Directory</span>
          </button>

          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">
              {currentStore.name}
            </span>
          </div>
        </div>

        {/* Quick Switch to other invited stores */}
        {userAccessibleStores.length > 1 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 hidden md:inline">Switch Store:</span>
            {userAccessibleStores.map((st) => (
              <button
                key={st.id}
                onClick={() => dispatch(setActiveStore(st.id))}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 active:scale-95 ${
                  st.id === currentStore.id
                    ? 'bg-[#212832] text-white dark:bg-[#2988c8] dark:text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <img src={st.logoUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                <span className="truncate max-w-[110px]">{st.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Shopper Tier Perk Callout Strip */}
      {tierConfig.discountPercent > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5 text-xs text-amber-900 dark:text-amber-200 font-semibold">
            <Crown className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>{userGatedTier} Shopper Privilege:</strong> You automatically receive <strong>{tierConfig.discountPercent}% extra savings</strong> and {tierConfig.shippingPerk.toLowerCase()} on this order!
            </span>
          </div>
          <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-500/40">
            AUTO-DISCOUNT APPLIED
          </span>
        </div>
      )}

      {/* 3. Modern Store Header Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#212832] shadow-lg">
        {/* Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900">
          <img
            src={currentStore.bannerUrl}
            alt={currentStore.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

          {/* Badges */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/90 text-white shadow-md backdrop-blur-xs flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>{currentStore.accessTier} Verified</span>
            </span>
          </div>
        </div>

        {/* Tenant Details Body */}
        <div className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 sm:-mt-12 mb-4 gap-4">
            <div className="flex items-end space-x-4">
              <img
                src={currentStore.logoUrl}
                alt={currentStore.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-[#212832] shadow-xl bg-white dark:bg-slate-900 shrink-0"
              />
              <div className="pb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {currentStore.name}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-[#2988c8] dark:text-amber-400">
                  {currentStore.category} • Authorized B2B Store Catalog
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => dispatch(toggleCartDrawer(true))}
                className="px-4 py-2.5 rounded-xl bg-[#2988c8] hover:bg-[#d97d10] text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>View Cart</span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed mb-4">
            {currentStore.description}
          </p>

          {/* Guarantees & Active Promo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4 text-[#2988c8] shrink-0" />
              <span><strong>SLA Guarantee:</strong> {currentStore.slaGuarantee}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
              <Tag className="w-4 h-4 text-[#2988c8] shrink-0" />
              <span><strong>Tax Rate:</strong> {(currentStore.taxDefaultRate * 100).toFixed(1)}% POS Rate</span>
            </div>
            {currentStore.activePromos.length > 0 && (
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/60">
                <div className="flex items-center space-x-1.5 truncate">
                  <Percent className="w-3.5 h-3.5 shrink-0 text-[#2988c8]" />
                  <span className="truncate">Code: <strong>{currentStore.activePromos[0].code}</strong> ({currentStore.activePromos[0].discountPercent}% Off)</span>
                </div>
                <button
                  onClick={() => handleCopyCoupon(currentStore.activePromos[0].code)}
                  className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 cursor-pointer font-bold shrink-0"
                >
                  {copiedCoupon === currentStore.activePromos[0].code ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Catalog Search & Category Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${storeProducts.length} items in ${currentStore.name}...`}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#212832] border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-[#2988c8] focus:outline-none shadow-xs"
            />
          </div>

          {/* Sort and Count */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> items
            </span>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-[#212832] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2988c8] cursor-pointer font-semibold shadow-xs"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="lead_time">Fastest Lead Time</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-[#212832] text-white dark:bg-[#2988c8] dark:text-white shadow-xs'
                  : 'bg-white dark:bg-[#212832] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#212832] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No products match your query
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try resetting your search query or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#2988c8] hover:bg-[#d97d10] text-white text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const hasTiers = product.priceTiers.length > 0;
            const maxTier = hasTiers ? product.priceTiers[product.priceTiers.length - 1] : null;
            
            // Calculate effective discounted price for user's tier
            const tierDiscountAmount = (product.basePrice * tierConfig.discountPercent) / 100;
            const memberPrice = product.basePrice - tierDiscountAmount;

            return (
              <div
                key={product.id}
                onClick={() => dispatch(setSelectedProductId(product.id))}
                className="group rounded-3xl bg-white dark:bg-[#212832] border border-slate-200 dark:border-slate-800 hover:border-[#2988c8] dark:hover:border-[#2988c8] transition-all duration-200 shadow-sm hover:shadow-xl overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* SKU badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/75 text-white backdrop-blur-xs">
                        {product.sku}
                      </span>
                    </div>

                    {/* In stock badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                        {product.stock} In Stock
                      </span>
                    </div>

                    {/* Promotional Offer overlay */}
                    {product.featuredOffer && (
                      <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-[#2988c8]/95 backdrop-blur-xs text-white text-[10px] font-semibold truncate flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span className="truncate">{product.featuredOffer}</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <span className="text-[11px] font-bold text-[#2988c8] dark:text-amber-400 uppercase tracking-wider block mb-1">
                      {product.category}
                    </span>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-[#2988c8] transition-colors mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                      {product.description}
                    </p>

                    {/* Price & Tier Savings Calculation Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 mb-4">
                      <div className="flex items-baseline justify-between">
                        <div>
                          {tierConfig.discountPercent > 0 ? (
                            <div className="flex items-baseline space-x-1.5">
                              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                                 ₹{memberPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-xs text-slate-400 line-through">
                                 ₹{product.basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                               ₹{product.basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 ml-1">/ unit</span>
                        </div>

                        {tierConfig.discountPercent > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            {tierConfig.discountPercent}% Off ({userGatedTier})
                          </span>
                        ) : maxTier && maxTier.discountPercentage > 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            Up to -{maxTier.discountPercentage}% Bulk
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>MOQ: <strong>{product.moq} Units</strong></span>
                        <span>Lead: <strong>{product.leadTimeDays}d dispatch</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(setSelectedProductId(product.id));
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Specs</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(product, e)}
                    className="py-2.5 px-3 rounded-xl bg-[#2988c8] hover:bg-[#d97d10] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
                  >
                    {quickAddedId === product.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add ({product.moq} MOQ)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => dispatch(setSelectedProductId(null))}
        />
      )}

      {/* VIP Modal */}
      <VipBlackModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
      />

    </div>
  );
};
