import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { OrderStatus, OrderSummary, PaymentMethod } from '../../types';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrdersApiResponse {
  success?: boolean;
  message?: string;
  orders?: OrderSummary[];
}

const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_URL_DOCKER ||
  'http://localhost:8080/api';

const API_BASE = RAW_API_BASE.replace(/\/+$/, '');

const buildUrl = (path: string) => `${API_BASE}/${path.replace(/^\/+/, '')}`;

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'CashOnDelivery',
  'Card',
  'BankTransfer',
];

const formatCurrency = (value: number) => `€${value.toFixed(2)}`;

const resolvePaymentMethod = (value: PaymentMethod | number | undefined): PaymentMethod => {
  if (typeof value === 'number') {
    return PAYMENT_METHODS[value] ?? 'CashOnDelivery';
  }
  return value ?? 'CashOnDelivery';
};

const resolveStatusIndex = (status: OrderStatus | number): number => {
  if (typeof status === 'number') {
    return status;
  }

  const index = ORDER_STATUSES.indexOf(status);
  return index >= 0 ? index : 0;
};

const MyOrdersModal: React.FC<MyOrdersModalProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (!token) {
      setError(t('orders.errors.noSession'));
      setOrders([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildUrl('orders/mine'), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      let body: OrdersApiResponse | null = null;
      try {
        body = (await response.json()) as OrdersApiResponse;
      } catch {
        body = null;
      }

      if (!response.ok || !body?.success) {
        throw new Error(body?.message || t('orders.errors.fetchFailed'));
      }

      const items = Array.isArray(body.orders) ? body.orders : [];
      setOrders(
        items
          .slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('orders.errors.fetchFailed');
      setError(message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) {
      return;
    }

    void fetchOrders();
  }, [fetchOrders, isAuthenticated, isOpen]);

  const statusConfig = useMemo(
    () => [
      {
        label: t('orders.status.pending'),
        className: 'bg-amber-100 text-amber-700 border-amber-200',
      },
      {
        label: t('orders.status.confirmed'),
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      },
      {
        label: t('orders.status.processing'),
        className: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      {
        label: t('orders.status.shipped'),
        className: 'bg-sky-100 text-sky-700 border-sky-200',
      },
      {
        label: t('orders.status.delivered'),
        className: 'bg-teal-100 text-teal-700 border-teal-200',
      },
      {
        label: t('orders.status.cancelled'),
        className: 'bg-rose-100 text-rose-700 border-rose-200',
      },
    ],
    [t]
  );

  if (!isOpen) {
    return null;
  }

  const resolveStatus = (status: OrderStatus | number) => {
    const index = resolveStatusIndex(status);
    const config = statusConfig[index] ?? statusConfig[0];
    return config;
  };

  const resolvedPaymentLabel = (value: PaymentMethod | number | undefined) => {
    const method = resolvePaymentMethod(value);
    switch (method) {
      case 'Card':
        return t('checkout.payment.card');
      case 'BankTransfer':
        return t('checkout.payment.bankTransfer');
      default:
        return t('checkout.payment.cashOnDelivery');
    }
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onClose();
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  };

  const handleRefresh = () => {
    void fetchOrders();
  };

  const renderOrderCard = (order: OrderSummary) => {
    const status = resolveStatus(order.status);
    const grandTotal = order.grandTotal ?? order.total + order.deliveryFee;

    return (
      <div key={order.id} className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-500">
              <Package className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {t('orders.detail.orderNumber')}
              </span>
            </div>
            <p className="text-lg font-semibold text-slate-900">{order.orderNumber}</p>
            <div className="mt-2 flex items-center space-x-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>{t('orders.detail.placedOn').replace('{date}', formatDate(order.createdAt))}</span>
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('orders.detail.paymentMethod')}
              </p>
              <p className="text-sm text-slate-900">
                {resolvedPaymentLabel(order.paymentMethod)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('orders.detail.total')}
              </p>
              <p className="text-sm text-slate-900">{formatCurrency(grandTotal)}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Truck className="h-4 w-4 text-slate-400" />
              <span>{t('orders.detail.deliveryStatus')}</span>
            </div>
            <div className="flex items-start space-x-2 text-sm text-slate-600">
              <MapPin className="mt-1 h-4 w-4 text-slate-400" />
              <div>
                {order.deliveryAddress && <p>{order.deliveryAddress}</p>}
                <p>
                  {[order.postalCode, order.city].filter(Boolean).join(' ')}
                </p>
                {order.country && <p>{order.country}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
            <ClipboardList className="h-4 w-4" />
            <span>{t('orders.detail.items')}</span>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center text-slate-500">
          <AlertCircle className="h-8 w-8 text-slate-400" />
          <p>{t('orders.errors.notAuthenticated')}</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 py-12 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>{t('orders.loading')}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center text-rose-600">
          <AlertCircle className="h-8 w-8" />
          <p>{error}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center space-x-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t('orders.actions.retry')}</span>
          </button>
        </div>
      );
    }

    if (!orders.length) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center text-slate-500">
          <Package className="h-10 w-10 text-slate-400" />
          <p className="font-semibold">{t('orders.empty.title')}</p>
          <p className="text-sm">{t('orders.empty.subtitle')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => renderOrderCard(order))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[70]" onClick={handleBackdropClick}>
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
      <div
        className="absolute inset-0 overflow-y-auto p-4 md:p-10"
        onClick={handleContentClick}
      >
        <div className="mx-auto flex max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 md:px-8">
            <div>
              <div className="flex items-center space-x-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {t('orders.modal.title')}
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-display font-semibold text-slate-900">
                {t('orders.modal.subtitle')}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                {t('orders.actions.refresh')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6 p-6 md:px-8 md:py-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default MyOrdersModal;
