import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShoppingCart, 
  Percent, 
  Check, 
  Layers, 
  Sparkles, 
  Plus, 
  Minus,
  Crown
} from 'lucide-react';
import { Product } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { addItemToCart, toggleCartDrawer } from '../../store/slices/cartSlice';
import { calculateTierPricing } from '../../store/slices/cartSlice';
import { getUserGatedTier, GATED_TIERS } from '../../utils/tierUtils';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.order);

  const [quantity, setQuantity] = useState<number>(product.moq || 1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const userGatedTier = getUserGatedTier(currentUser, orders);
  const tierConfig = GATED_TIERS[userGatedTier];

  const pricing = calculateTierPricing(product, quantity);

  // Calculate shopper tier discount
  const shopperTierDiscountAmount = (pricing.itemSubtotal * tierConfig.discountPercent) / 100;
  const finalPriceWithTier = pricing.itemSubtotal - shopperTierDiscountAmount;

  const handleAddToCart = () => {
    dispatch(addItemToCart({ product, quantity }));
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
      dispatch(toggleCartDrawer(true));
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs text-[#e67e22] font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 rounded-md border border-amber-200 dark:border-amber-900">
              SKU: {product.sku}
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {product.storeName}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          
          {/* Left: Image & Compliance */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-900 border border-slate-200 dark:border-slate-800">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.featuredOffer && (
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-[#e67e22] text-white text-[11px] font-bold shadow-md flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Special Offer</span>
                </div>
              )}
            </div>

            {/* Compliance Tags */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Certified Standards & Compliance:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.complianceTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    <Check className="w-3 h-3 mr-1 text-emerald-500" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                <Layers className="w-3.5 h-3.5 text-[#e67e22] mr-1.5" />
                Technical Specifications
              </p>
              <div className="space-y-1.5 text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500 dark:text-slate-400">{key}:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Pricing, Tiers, Quantity & Add to Cart */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                {product.name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Price Display */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-slate-50 dark:from-slate-900 dark:to-[#16212e] border border-amber-100 dark:border-slate-800 mb-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      ${pricing.appliedUnitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/ unit</span>
                  </div>

                  {pricing.appliedDiscountPercent > 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#e67e22] text-white shadow-xs">
                      {pricing.appliedDiscountPercent}% Volume Tier Saved
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>MOQ: <strong className="text-slate-800 dark:text-slate-200">{product.moq} units</strong></span>
                  <span>Lead Time: <strong className="text-slate-800 dark:text-slate-200">{product.leadTimeDays}d</strong></span>
                  <span>Tax: <strong className="text-slate-800 dark:text-slate-200">{(product.taxRate * 100).toFixed(1)}%</strong></span>
                </div>
              </div>

              {/* Shopper Tier Discount Callout */}
              {tierConfig.discountPercent > 0 && (
                <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>{userGatedTier} Shopper: Extra {tierConfig.discountPercent}% Off Applied</span>
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    -${shopperTierDiscountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Dynamic Volume Pricing Table */}
              {product.priceTiers.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Tiered Bulk Pricing:
                    </p>
                    <span className="text-[11px] text-[#e67e22] font-semibold">Applied in Redux Cart</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {product.priceTiers.map((tier, idx) => {
                      const isActiveTier = quantity >= tier.minQuantity && 
                        (idx === product.priceTiers.length - 1 || quantity < product.priceTiers[idx + 1]?.minQuantity);

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isActiveTier
                              ? 'border-[#e67e22] bg-amber-50/80 dark:bg-amber-950/60 ring-1 ring-[#e67e22]'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40'
                          }`}
                        >
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {tier.minQuantity}+ Units
                          </p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            ${tier.unitPrice.toFixed(2)}
                          </p>
                          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            {tier.discountPercentage > 0 ? `-${tier.discountPercentage}% OFF` : 'Base Tier'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Select Order Quantity (MOQ: {product.moq}):
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(product.moq || 1, q - 1))}
                      disabled={quantity <= (product.moq || 1)}
                      className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min={product.moq || 1}
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(product.moq || 1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center font-bold text-sm bg-transparent text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Calculated Subtotal Preview */}
                  <div className="text-right flex-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Item Subtotal</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      ${(tierConfig.discountPercent > 0 ? finalPriceWithTier : pricing.itemSubtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addedAnimation}
                className="flex-1 py-3 px-4 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Added to Cart! Opening...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add {quantity} Units to Cart (${(tierConfig.discountPercent > 0 ? finalPriceWithTier : pricing.itemSubtotal).toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
