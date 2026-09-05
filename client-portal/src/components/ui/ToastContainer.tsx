import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { removeToast } from '../../store/slices/toastSlice';

export const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.toast.toasts);

  useEffect(() => {
    toasts.forEach((toast) => {
      if (!toast._timeout) {
        toast._timeout = true;
        setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, 4000);
      }
    });
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border
            transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right fade-in
            ${
              toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                : 'bg-sky-50 dark:bg-sky-950/90 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200'
            }
          `}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
          <p className="text-xs font-medium flex-1 leading-relaxed">{toast.message}</p>
          <button
            onClick={() => dispatch(removeToast(toast.id))}
            className="shrink-0 p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
