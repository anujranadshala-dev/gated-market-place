import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  Building2, 
  Package, 
  Plus, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setActiveOrder, toggleOrderModal } from '../../store/slices/orderSlice';
import { setCurrentView } from '../../store/slices/tenantSlice';
import { Order } from '../../types';

export const OrdersHistoryView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.order);
  const { currentUser } = useAppSelector((state) => state.auth);

  const handleSelectOrder = (order: Order) => {
    dispatch(setActiveOrder(order));
    dispatch(toggleOrderModal(true));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#e67e22] text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Audit & Procurement History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Corporate Purchase Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9aa8b2] mt-1">
            Track multi-tenant order states from pending authorization through dispatch.
          </p>
        </div>

        <button
          onClick={() => dispatch(setCurrentView('dashboard'))}
          className="px-4 py-2.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold shadow-md transition-colors self-start sm:self-center flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Tenant Procurement</span>
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#1a2530] rounded-2xl border border-slate-200 dark:border-slate-700">
          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Orders Recorded Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9aa8b2] mt-1">
            Browse accessible tenant stores, accumulate items in your Redux cart, and submit your checkout.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => handleSelectOrder(order)}
              className="bg-white dark:bg-[#1a2530] rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:border-[#e67e22] dark:hover:border-[#e67e22] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#e67e22] shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      order.status === 'Pending'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                        : order.status === 'Approved'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                        : order.status === 'Shipped'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#9aa8b2]">
                    Created on {new Date(order.createdAt).toLocaleDateString()} • {order.items.reduce((s, i) => s + i.quantity, 0)} Items across {order.storeIds.length} Stores
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Terms: <strong>{order.paymentMethod.replace('_', ' ')}</strong> {order.poNumber && `(${order.poNumber})`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end space-x-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Total Authorized</span>
                  <span className="text-base font-extrabold text-[#1a2530] dark:text-white">
                    ${order.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center text-xs text-[#e67e22] font-semibold">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
