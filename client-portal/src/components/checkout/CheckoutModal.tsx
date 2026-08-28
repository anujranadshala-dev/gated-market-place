import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  RefreshCw,
  AlertCircle,
  Smartphone,
  Banknote,
  Building,
  MapPin,
  Phone,
  User as UserIcon,
  Home,
  Crown,
  Sparkles
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { toggleCheckoutModal, clearCart } from '../../store/slices/cartSlice';
import { checkoutSuccess, startCheckoutProcessing } from '../../store/slices/orderSlice';
import { recordOrderSpend } from '../../store/slices/authSlice';
import { getUserGatedTier, getTierProgress, GATED_TIERS } from '../../utils/tierUtils';
import { Order } from '../../types';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, isCheckoutModalOpen, promoDiscountPercent, appliedPromoCode } = useAppSelector((state) => state.cart);
  const { currentUser } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.order);

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI_WALLET' | 'COD' | 'NET_BANKING'>('CARD');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('890');
  
  // Shipping Form State
  const [recipientName, setRecipientName] = useState(currentUser?.fullName || '');
  const [recipientPhone, setRecipientPhone] = useState(currentUser?.mobileNumber || currentUser?.phone || '');
  const [addressLine, setAddressLine] = useState(currentUser?.address?.street || '');
  const [apartment, setApartment] = useState(currentUser?.address?.apartment || '');
  const [city, setCity] = useState(currentUser?.address?.city || '');
  const [state, setState] = useState(currentUser?.address?.state || '');
  const [zipCode, setZipCode] = useState(currentUser?.address?.zipCode || '');
  const [deliveryNotes, setDeliveryNotes] = useState('Please ring the doorbell upon arrival.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assigned Gated Tier automated discount calculation
  const userGatedTier = getUserGatedTier(currentUser, orders);
  const tierConfig = GATED_TIERS[userGatedTier];
  const tierDiscountPercent = tierConfig.discountPercent;

  useEffect(() => {
    if (currentUser) {
      setRecipientName(currentUser.fullName);
      setRecipientPhone(currentUser.mobileNumber || currentUser.phone || '');
      if (currentUser.address) {
        setAddressLine(currentUser.address.street || '');
        setApartment(currentUser.address.apartment || '');
        setCity(currentUser.address.city || '');
        setState(currentUser.address.state || '');
        setZipCode(currentUser.address.zipCode || '');
      }
    }
  }, [currentUser, isCheckoutModalOpen]);

  if (!isCheckoutModalOpen) return null;

  // Calculate authoritative order values
  const subtotal = items.reduce((sum, item) => sum + item.itemSubtotal, 0);
  const couponDiscountAmount = (subtotal * promoDiscountPercent) / 100;
  
  // Automated Tier Discount
  const tierDiscountAmount = ((subtotal - couponDiscountAmount) * tierDiscountPercent) / 100;
  const totalDiscounts = couponDiscountAmount + tierDiscountAmount;
  
  const taxableSubtotal = subtotal - totalDiscounts;
  const effectiveDiscountRate = 1 - (promoDiscountPercent + tierDiscountPercent) / 100;
  const totalTax = items.reduce((sum, item) => sum + (item.itemTax * Math.max(0, effectiveDiscountRate)), 0);
  
  // Shipping fee
  let shippingFee = 0;
  if (items.length > 0) {
    if (userGatedTier === 'VIP Black' || userGatedTier === 'Gold') {
      shippingFee = 0;
    } else if (userGatedTier === 'Silver' && taxableSubtotal >= 75) {
      shippingFee = 0;
    } else if (taxableSubtotal >= 150) {
      shippingFee = 0;
    } else {
      shippingFee = 9.99;
    }
  }

  const grandTotal = taxableSubtotal + totalTax + shippingFee;

  const distinctStoreIds = Array.from(new Set(items.map((i) => i.storeId)));

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    dispatch(startCheckoutProcessing());

    setTimeout(() => {
      const newOrder: Order = {
        orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        userId: currentUser?.id || 'usr_guest',
        userEmail: currentUser?.email || 'shopper@example.com',
        organization: currentUser?.organization || 'Home Delivery',
        items: [...items],
        subtotal,
        discountTotal: totalDiscounts,
        taxTotal: totalTax,
        shippingFee,
        grandTotal,
        status: 'Pending',
        paymentMethod: 'CORPORATE_CARD',
        shippingAddress: {
          recipientName: recipientName || currentUser?.fullName || 'Valued Customer',
          company: apartment ? `Apt: ${apartment}` : 'Home Address',
          addressLine: apartment ? `${addressLine}, ${apartment}` : addressLine,
          city,
          state,
          zipCode,
          country: 'United States'
        },
        notes: deliveryNotes,
        createdAt: new Date().toISOString(),
        storeIds: distinctStoreIds
      };

      // Automatically record spend to trigger automated tier upgrades
      dispatch(recordOrderSpend({ amount: grandTotal }));
      dispatch(checkoutSuccess(newOrder));
      dispatch(clearCart());
      dispatch(toggleCheckoutModal(false));
      setIsSubmitting(false);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch (err) {}
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#212832] rounded-2xl border border-slate-200 dark:border-slate-700 max-w-4xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#2988c8] text-white flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Secure Online Checkout
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#9aa8b2]">
                Complete your delivery details and payment
              </p>
            </div>
          </div>

          <button
            onClick={() => dispatch(toggleCheckoutModal(false))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Shipping Address & Payment Selection (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Shipping Address Form */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                    <Truck className="w-4 h-4 text-[#2988c8] mr-1.5" />
                    Delivery & Shipping Address
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-[#9aa8b2]">
                    Deliver to your doorstep
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
                      />
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile / Contact Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="e.g. +1 (512) 890-2144"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
                      />
                      <Phone className="w-3.5 h-3.5 text-[#2988c8] absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Street Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Apt / Suite / Flat
                    </label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Apt 4B"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Austin"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="TX"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ZIP Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="78759"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Leave package by the front door or call upon arrival"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'border-[#2988c8] bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-[#2988c8]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#2988c8] mb-1" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Credit Card
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-[#9aa8b2]">
                      Visa, Master
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI_WALLET')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === 'UPI_WALLET'
                        ? 'border-[#2988c8] bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-[#2988c8]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-[#2988c8] mb-1" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      UPI / Wallet
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-[#9aa8b2]">
                      Apple / GPay
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'border-[#2988c8] bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-[#2988c8]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-[#2988c8] mb-1" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Cash on Delivery
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-[#9aa8b2]">
                      Pay at door
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NET_BANKING')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === 'NET_BANKING'
                        ? 'border-[#2988c8] bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-[#2988c8]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Building className="w-4 h-4 text-[#2988c8] mb-1" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Net Banking
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-[#9aa8b2]">
                      Direct Transfer
                    </p>
                  </button>
                </div>

                {/* Card Fields Preview (if CARD selected) */}
                {paymentMethod === 'CARD' && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500">Expires</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500">CVV</label>
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          maxLength={4}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Col: Order Summary & Review (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Cart Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
                </h3>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((item) => (
                    <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-800 dark:text-white truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-[#9aa8b2]">
                          Qty: {item.quantity} × ${item.appliedUnitPrice.toFixed(2)}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 shrink-0">
                        ${item.itemSubtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Breakdown */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {tierDiscountAmount > 0 && (
                    <div className="flex justify-between text-[#2988c8] dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-900/60">
                      <span className="flex items-center space-x-1">
                        <Crown className="w-3.5 h-3.5" />
                        <span>{userGatedTier} Tier Discount ({tierDiscountPercent}%):</span>
                      </span>
                      <span>-${tierDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {couponDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Promo Discount ({appliedPromoCode}):</span>
                      <span>-${couponDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Point-of-Sale Tax:</span>
                    <span>${totalTax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Shipping:</span>
                    <span>{shippingFee === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : `$${shippingFee.toFixed(2)}`}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                    <span>Total to Pay:</span>
                    <span className="text-base text-[#2988c8] font-mono">
                      ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#2988c8] hover:bg-[#d97d10] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Placing Your Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-white" />
                      <span>Pay & Complete Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
};
