import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Building2, 
  Truck, 
  Printer, 
  ArrowRight,
  RefreshCw,
  Package,
  Calendar
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { toggleOrderModal, advanceOrderStatus } from '../../store/slices/orderSlice';
import { setCurrentView } from '../../store/slices/tenantSlice';
import { Order } from '../../types';

export const OrderTrackingModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeOrder, isOrderModalOpen, orders } = useAppSelector((state) => state.order);

  if (!isOrderModalOpen || !activeOrder) return null;

  const steps: { key: Order['status']; label: string; desc: string }[] = [
    { key: 'Pending', label: 'Pending B2B Authorization', desc: 'Order received & queued in multi-tenant audit engine' },
    { key: 'Approved', label: 'PO Verified & Approved', desc: 'Finance & Compliance review passed' },
    { key: 'Processing', label: 'Tenant Assembly & QA', desc: 'Hardware calibration and ISO packaging' },
    { key: 'Shipped', label: 'Freight Dispatched', desc: 'Carrier tracking and bill of lading active' }
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === activeOrder.status);

  const handleNextStatus = () => {
    if (activeOrder.status === 'Pending') {
      dispatch(advanceOrderStatus({ orderId: activeOrder.id, newStatus: 'Approved' }));
    } else if (activeOrder.status === 'Approved') {
      dispatch(advanceOrderStatus({ orderId: activeOrder.id, newStatus: 'Processing' }));
    } else if (activeOrder.status === 'Processing') {
      dispatch(advanceOrderStatus({ orderId: activeOrder.id, newStatus: 'Shipped' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1a2530] rounded-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#e67e22] text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Order Registered: {activeOrder.orderNumber}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  {activeOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#9aa8b2]">
                Submitted by {activeOrder.organization}
              </p>
            </div>
          </div>

          <button
            onClick={() => dispatch(toggleOrderModal(false))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Status Stepper */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Live Lifecycle Tracking:
              </span>
              {activeOrder.status !== 'Shipped' && (
                <button
                  onClick={handleNextStatus}
                  className="px-2.5 py-1 rounded bg-[#e67e22] text-white text-[11px] font-medium hover:bg-[#d35400] transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span>Simulate Next Stage</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {steps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-lg border text-left ${
                      isCurrent
                        ? 'border-[#e67e22] bg-amber-50/70 dark:bg-amber-950/40 ring-1 ring-[#e67e22]'
                        : isPassed
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {step.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Payment & Terms</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {activeOrder.paymentMethod.replace('_', ' ')}
              </span>
              {activeOrder.poNumber && (
                <p className="font-mono text-[11px] text-[#e67e22] mt-0.5">
                  Ref: {activeOrder.poNumber}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Shipping Destination</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {activeOrder.shippingAddress.company}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-[#9aa8b2] truncate">
                {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} {activeOrder.shippingAddress.zipCode}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Grand Authorized Total</span>
              <span className="font-extrabold text-base text-[#1a2530] dark:text-white">
                ${activeOrder.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[10px] text-slate-500">Tax & Freight included</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Purchased Line Items:
            </h4>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Product / SKU</th>
                    <th className="p-3">Tenant Store</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeOrder.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3">
                        <p className="font-bold text-slate-900 dark:text-white">{item.product.name}</p>
                        <p className="text-[10px] font-mono text-[#e67e22]">{item.product.sku}</p>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{item.storeName}</td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right font-mono">${item.appliedUnitPrice.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-bold">${item.itemSubtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PO Invoice</span>
            </button>

            <button
              onClick={() => {
                dispatch(toggleOrderModal(false));
                dispatch(setCurrentView('dashboard'));
              }}
              className="px-4 py-2 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              Back to Gated Stores
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
