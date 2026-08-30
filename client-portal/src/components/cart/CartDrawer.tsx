import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ArrowRight, 
  ShieldCheck, 
  Percent, 
  Tag, 
  Sparkles,
  Building2,
  Lock,
  AlertCircle,
  Crown,
  Award,
  Zap
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { 
  toggleCartDrawer, 
  updateItemQuantity, 
  removeItemFromCart, 
  applyPromoCode, 
  removePromoCode, 
  toggleCheckoutModal,
  clearCart
} from '../../store/slices/cartSlice';
import { getUserGatedTier, getTierProgress, GATED_TIERS } from '../../utils/tierUtils';

export const CartDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, isCartDrawerOpen, appliedPromoCode, promoDiscountPercent } = useAppSelector((state) => state.cart);
  const { stores } = useAppSelector((state) => state.tenant);
  const { currentUser } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.order);

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isCartDrawerOpen) return null;

  // Determine user's Assigned Gated Tier
  const userGatedTier = getUserGatedTier(currentUser, orders);
  const tierConfig = GATED_TIERS[userGatedTier];
  const tierProgress = getTierProgress(currentUser, orders);
  const tierDiscountPercent = tierConfig.discountPercent;

  // Group items by storeId
  const itemsByStore = items.reduce((acc, item) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = [];
    }
    acc[item.storeId].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  // Compute overall financial totals
  const rawSubtotal = items.reduce((sum, item) => sum + (item.product.basePrice * item.quantity), 0);
  const tieredSubtotal = items.reduce((sum, item) => sum + item.itemSubtotal, 0);
  const volumeDiscountSaved = Math.max(0, rawSubtotal - tieredSubtotal);
  
  // 1. Coupon discount
  const couponDiscountAmount = (tieredSubtotal * promoDiscountPercent) / 100;
  
  // 2. Automated Assigned Gated Tier discount
  const tierDiscountAmount = ((tieredSubtotal - couponDiscountAmount) * tierDiscountPercent) / 100;
  
  const taxableSubtotal = tieredSubtotal - couponDiscountAmount - tierDiscountAmount;
  
  const effectiveDiscountRate = 1 - (promoDiscountPercent + tierDiscountPercent) / 100;
  const totalTax = items.reduce((sum, item) => sum + (item.itemTax * Math.max(0, effectiveDiscountRate)), 0);
  
  // Free shipping perks based on Tier or cart size
  let estimatedShipping = 0;
  if (items.length > 0) {
    if (userGatedTier === 'VIP Black') {
      estimatedShipping = 0; // Free 1-Day Priority Air
    } else if (userGatedTier === 'Gold') {
      estimatedShipping = 0; // Free Standard Shipping
    } else if (userGatedTier === 'Silver' && taxableSubtotal >= 6000) {
      estimatedShipping = 0; // Free over ₹6,000
    } else if (taxableSubtotal >= 12000) {
      estimatedShipping = 0; // Standard Free over ₹12,000
    } else {
      estimatedShipping = 799;
    }
  }

  const grandTotal = taxableSubtotal + totalTax + estimatedShipping;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();

    // Check if code matches any active store promo
    let foundDiscount = 0;
    for (const store of stores) {
      const match = store.activePromos.find((p) => p.code.toUpperCase() === code);
      if (match) {
        foundDiscount = match.discountPercent;
        break;
      }
    }

    if (foundDiscount > 0) {
      dispatch(applyPromoCode({ code, discountPercent: foundDiscount }));
      setPromoError('');
      setPromoInput('');
    } else if (code === 'B2BVIP10') {
      dispatch(applyPromoCode({ code: 'B2BVIP10', discountPercent: 10 }));
      setPromoError('');
      setPromoInput('');
    } else {
      setPromoError("Invalid code. Active demo codes: NEXUSQ3, PHOTON10, GROWBULK, B2BVIP10");
    }
  };

  const handleProceedCheckout = () => {
    dispatch(toggleCartDrawer(false));
    dispatch(toggleCheckoutModal(true));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={() => dispatch(toggleCartDrawer(false))} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#161f28] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Cart Header */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#2988c8] text-white flex items-center justify-center shadow-xs">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Corporate Cart
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#9aa8b2]">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} Items across {Object.keys(itemsByStore).length} Stores
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {items.length > 0 && (
                <button
                  onClick={() => dispatch(clearCart())}
                  className="text-[11px] text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-medium px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => dispatch(toggleCartDrawer(false))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Your B2B Cart is Empty
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#9aa8b2] mt-1 max-w-xs mx-auto">
                  Browse your authorized tenant stores and add precision industrial equipment with tiered bulk pricing.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Volume Tier Alert banner */}
                {volumeDiscountSaved > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center space-x-2 text-xs text-amber-800 dark:text-amber-300">
                    <Sparkles className="w-4 h-4 text-[#2988c8] shrink-0" />
                    <span>
                      <strong>Volume Tier Applied:</strong> You're saving ₹{volumeDiscountSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })} on bulk quantities!
                    </span>
                  </div>
                )}

                {/* Grouped by Tenant Store */}
                {Object.entries(itemsByStore).map(([storeId, storeItems]) => {
                  const storeInfo = stores.find((s) => s.id === storeId);
                  return (
                    <div
                      key={storeId}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#212832] overflow-hidden shadow-xs"
                    >
                      {/* Tenant Header Pill */}
                      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-3.5 h-3.5 text-[#2988c8]" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                            {storeInfo?.name || storeItems[0].storeName}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {( (storeInfo?.taxDefaultRate || 0.0825) * 100).toFixed(1)}% Tax
                        </span>
                      </div>

                      {/* Store Items */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {storeItems.map((item) => (
                          <div key={item.product.id} className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-14 h-14 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="font-mono text-[10px] text-[#2988c8] font-bold">
                                  {item.product.sku}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                                  {item.product.name}
                                </h4>
                                <div className="mt-1 flex items-center space-x-2 text-[11px]">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                     ₹{item.appliedUnitPrice.toFixed(2)}
                                  </span>
                                  {item.appliedDiscountPercent > 0 && (
                                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                      (-{item.appliedDiscountPercent}% tier)
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => dispatch(removeItemFromCart(item.product.id))}
                                className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Quantity Controls & Line Subtotal */}
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">
                                <button
                                  type="button"
                                  onClick={() =>
                                    dispatch(
                                      updateItemQuantity({
                                        productId: item.product.id,
                                        quantity: item.quantity - 1
                                      })
                                    )
                                  }
                                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    dispatch(
                                      updateItemQuantity({
                                        productId: item.product.id,
                                        quantity: item.quantity + 1
                                      })
                                    )
                                  }
                                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-right">
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                  ₹{item.itemSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Promo Code Input Form */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Promo or Corporate Discount Code:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="e.g. NEXUSQ3 or B2BVIP10"
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2988c8]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {appliedPromoCode && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-900">
                      <span>Promo Applied: <strong>{appliedPromoCode}</strong> (-{promoDiscountPercent}%)</span>
                      <button
                        type="button"
                        onClick={() => dispatch(removePromoCode())}
                        className="text-rose-500 underline font-medium text-[11px] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {promoError && (
                    <p className="text-xs text-rose-600">
                      {promoError}
                    </p>
                  )}
                </form>

              </div>
            )}
          </div>

          {/* Cart Footer Summary */}
          {items.length > 0 && (
            <div className="p-6 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>List Price Subtotal:</span>
                  <span>₹{rawSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {volumeDiscountSaved > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                    <span>Volume MOQ Rebate:</span>
                    <span>-₹{volumeDiscountSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {/* Assigned Gated Tier Automated Discount */}
                {tierDiscountAmount > 0 && (
                  <div className="flex justify-between text-[#2988c8] dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-900/60">
                    <span className="flex items-center space-x-1">
                      <Crown className="w-3.5 h-3.5" />
                      <span>{userGatedTier} Tier ({tierDiscountPercent}% Off):</span>
                    </span>
                    <span>-₹{tierDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Promo Code ({appliedPromoCode}):</span>
                    <span>-₹{couponDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Point-of-Sale Tax:</span>
                  <span>₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping & Delivery:</span>
                  <span>
                    {estimatedShipping === 0 ? (
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {userGatedTier === 'VIP Black' ? 'FREE Priority 1-Day (VIP)' : 'FREE Shipping'}
                      </strong>
                    ) : (
                       `₹${estimatedShipping.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              {/* Next Tier Progression Teaser */}
              {!tierProgress.isMaxSpendTier && !tierProgress.isVipBlack && (
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">
                       Spend <strong>₹{Math.max(0, tierProgress.targetSpend - (tierProgress.totalSpent + grandTotal)).toFixed(2)}</strong> more to unlock <strong>{tierProgress.nextTier} Tier</strong>!
                    </span>
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Grand Total (INR):
                </span>
                <span className="text-xl font-extrabold text-[#212832] dark:text-white">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedCheckout}
                className="w-full py-3 px-4 rounded-xl bg-[#2988c8] hover:bg-[#d97d10] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                <span>Proceed to Checkout ({userGatedTier} Tier)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
