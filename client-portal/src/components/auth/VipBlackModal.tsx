import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Lock,
  ArrowRight,
  Flame,
  Star
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { subscribeToVipBlack, cancelVipBlackSubscription } from '../../store/slices/authSlice';
import confetti from 'canvas-confetti';

interface VipBlackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VipBlackModal: React.FC<VipBlackModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const isAlreadyVip = currentUser?.isVipBlackSubscribed;

  const handleSubscribe = () => {
    setIsProcessing(true);

    setTimeout(() => {
      dispatch(subscribeToVipBlack({ plan: selectedPlan }));
      setIsProcessing(false);
      setShowSuccess(true);

      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#2988c8', '#f39c12', '#ffd700', '#ffffff', '#2c3e50']
        });
      } catch (e) {}

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1800);
    }, 900);
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel your VIP Black Reserve membership? You will return to your spend-based assigned tier.')) {
      dispatch(cancelVipBlackSubscription());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#212832] via-[#212832] to-[#171c23] text-white rounded-3xl border border-amber-500/40 shadow-2xl shadow-amber-500/10 overflow-hidden animate-in zoom-in-95 my-8">
        
        {/* Decorative ambient glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="relative p-6 sm:p-8 pb-4 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Subscription Tier • Exclusive Membership</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-400 tracking-tight">
            VIP Black Reserve
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto">
            Instant subscription access to all locked gated stores, 15% automatic cart discounts, and 24/7 priority white-glove fulfillment.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 pt-2 space-y-6">
          
          {/* Plan Selector */}
          {!isAlreadyVip ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Annual Plan */}
              <div
                onClick={() => setSelectedPlan('annual')}
                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedPlan === 'annual'
                    ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-extrabold text-slate-950 uppercase tracking-wide">
                  Save 20% • Best Value
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Annual Membership</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === 'annual' ? 'border-amber-400 bg-amber-400' : 'border-slate-600'}`}>
                    {selectedPlan === 'annual' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>}
                  </div>
                </div>
                <div className="mt-3 flex items-baseline space-x-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">$199</span>
                  <span className="text-xs text-slate-400 font-medium">/ year</span>
                </div>
                <p className="text-[11px] text-amber-300/90 mt-1">
                  Equivalent to just $16.58 / month
                </p>
              </div>

              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedPlan === 'monthly'
                    ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Monthly Flex</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === 'monthly' ? 'border-amber-400 bg-amber-400' : 'border-slate-600'}`}>
                    {selectedPlan === 'monthly' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>}
                  </div>
                </div>
                <div className="mt-3 flex items-baseline space-x-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">$19.99</span>
                  <span className="text-xs text-slate-400 font-medium">/ month</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cancel anytime in your profile
                </p>
              </div>
            </div>
          ) : (
            /* Active VIP Black Status Card */
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg font-black">
                  <Crown className="w-6 h-6 fill-slate-950" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">Active VIP Black Subscription</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Plan: <strong className="text-amber-300 capitalize">{currentUser?.vipBlackSubscriptionPlan || 'Annual'}</strong> • Expires on {currentUser?.vipBlackExpiresAt ? new Date(currentUser.vipBlackExpiresAt).toLocaleDateString() : 'Auto-renewing'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors cursor-pointer self-start sm:self-center"
              >
                Cancel Subscription
              </button>
            </div>
          )}

          {/* Perks Matrix */}
          <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VIP Black Subscriber Privileges</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Top 15% Maximum Discount</span>
                  <p className="text-[11px] text-slate-400">Applied automatically at checkout on all invited store orders.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">VIP All-Store Access Pass</span>
                  <p className="text-[11px] text-slate-400">Immediate access to explore all marketplace catalogs.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Free Priority 1-Day Air</span>
                  <p className="text-[11px] text-slate-400">Complimentary expedited shipping on every single item.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Zero MOQ Restrictions</span>
                  <p className="text-[11px] text-slate-400">Order single units without minimum quantity requirements.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          {!isAlreadyVip ? (
            <div className="space-y-3">
              <button
                onClick={handleSubscribe}
                disabled={isProcessing || showSuccess}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-[#2988c8] to-amber-600 hover:from-amber-400 hover:via-amber-500 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {showSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-slate-950" />
                    <span>VIP Black Activated!</span>
                  </>
                ) : isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Activating Subscription...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 text-slate-950 fill-slate-950" />
                    <span>
                      Subscribe to VIP Black ({selectedPlan === 'annual' ? '$199 / yr' : '$19.99 / mo'})
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Secure 256-bit payment</span>
                </span>
                <span>•</span>
                <span>Cancel anytime in 1-click</span>
                <span>•</span>
                <span>Instant tier activation</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close & Enjoy VIP Black Privileges
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
