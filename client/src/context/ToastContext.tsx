import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, X } from 'lucide-react';

interface CartToast {
  id: number;
  productName: string;
  productImage?: string;
}

interface ToastContextType {
  showCartAdded: (productName: string, productImage?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<CartToast[]>([]);
  const { t } = useTranslation();

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showCartAdded = useCallback((productName: string, productImage?: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, productName, productImage }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showCartAdded }}>
      {children}
      {/* Toast stack — top-right desktop, top-center mobile */}
      <div className="fixed top-20 inset-x-0 flex flex-col items-center gap-2 z-[80] pointer-events-none px-4 sm:items-end sm:right-4 sm:inset-x-auto sm:px-0">
        {toasts.map(toast => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto bg-white shadow-xl border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 w-full max-w-sm animate-[toast-in_0.25s_ease-out]"
          >
            {toast.productImage ? (
              <img src={toast.productImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
            ) : (
              <CheckCircle2 size={28} className="text-accent-600 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-accent-700 uppercase tracking-wider">
                {t('cartToast.added')}
              </p>
              <p className="text-sm font-medium text-gray-900 truncate">{toast.productName}</p>
            </div>
            <Link
              to="/cart"
              onClick={() => dismiss(toast.id)}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
            >
              {t('cartToast.viewCart')}
            </Link>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
