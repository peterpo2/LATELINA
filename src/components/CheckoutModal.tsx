/* cspell:word nhif */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Fingerprint,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useFeatureToggles } from '../context/FeatureToggleContext';
import type { CartItem, PaymentMethod } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  total: number;
  onClose: () => void;
  onOrderCreated?: (order: ApiOrder) => void;
}

interface ApiOrderItem {
  id: number;
  productId: number;
  productName: string;
  productDescription?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ApiNhifPrescription {
  id: number;
  prescriptionNumber: string;
  personalIdentificationNumber: string;
  prescribedDate: string;
  purchaseDate: string;
  orderNumber: string;
  userId: string;
  patientPaidAmount: number;
  nhifPaidAmount: number;
  otherCoverageAmount?: number | null;
  createdAt: string;
}

interface ApiOrder {
  id: number;
  orderNumber: string;
  status: number;
  paymentMethod: PaymentMethod | number;
  total: number;
  deliveryFee: number;
  grandTotal?: number;
  customerName?: string;
  customerEmail?: string;
  phoneNumber?: string;
  deliveryAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: ApiOrderItem[];
  nhifPrescriptions?: ApiNhifPrescription[];
}

interface CreateOrderResponse {
  success?: boolean;
  message?: string;
  order?: ApiOrder;
}

type CheckoutStep = 'prescription' | 'form' | 'eprescription' | 'success';

const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_URL_DOCKER ||
  'http://localhost:8080/api';

const API_BASE = RAW_API_BASE.replace(/\/+$/, '');

const buildUrl = (path: string) => `${API_BASE}/${path.replace(/^\/+/, '')}`;

const PAYMENT_METHODS: PaymentMethod[] = [
  'CashOnDelivery',
  'Card',
  'BankTransfer',
];

const formatCurrency = (value: number) => `€${value.toFixed(2)}`;

const mapPaymentMethod = (value: PaymentMethod | number | undefined): PaymentMethod => {
  if (typeof value === 'number') {
    return PAYMENT_METHODS[value] ?? 'CashOnDelivery';
  }
  return value ?? 'CashOnDelivery';
};

const DELIVERY_THRESHOLD = 25;
const STANDARD_DELIVERY_FEE = 4.99;

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  total,
  onClose,
  onOrderCreated,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { prescriptionFeaturesEnabled } = useFeatureToggles();

  const hasPrescriptionItems = useMemo(
    () => items.some((item) => item.product.requiresPrescription),
    [items],
  );
  const requiresPrescription = prescriptionFeaturesEnabled && hasPrescriptionItems;

  const [step, setStep] = useState<CheckoutStep>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<ApiOrder | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Bulgaria',
    paymentMethod: 'CashOnDelivery' as PaymentMethod,
    notes: '',
    egn: '',
    prescriptionCode: '',
  });
  const [prescriptionData, setPrescriptionData] = useState({
    personalIdentificationNumber: '',
    prescriptionNumber: '',
  });
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);

  const deliveryFee = useMemo(
    () => (total >= DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE),
    [total],
  );

  const grandTotal = useMemo(
    () => total + deliveryFee,
    [total, deliveryFee],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStep(requiresPrescription ? 'prescription' : 'form');
    setIsSubmitting(false);
    setError(null);
    setCreatedOrder(null);
    setPrescriptionData({
      personalIdentificationNumber: '',
      prescriptionNumber: '',
    });
    setPrescriptionError(null);
    setFormData({
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      address: user?.address ?? '',
      city: '',
      postalCode: '',
      country: 'Bulgaria',
      paymentMethod: requiresPrescription ? 'Card' : 'CashOnDelivery',
      notes: '',
      egn: '',
      prescriptionCode: '',
    });
  }, [isOpen, requiresPrescription, user]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrescriptionInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    setPrescriptionData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (value: PaymentMethod) => {
    if (requiresPrescription && value !== 'Card') {
      return;
    }
    setFormData((prev) => ({ ...prev, paymentMethod: value }));
  };

  const handlePrescriptionSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const personalId = prescriptionData.personalIdentificationNumber.trim();
    const prescriptionNumber = prescriptionData.prescriptionNumber.trim();

    if (!personalId || !prescriptionNumber) {
      setPrescriptionError(t('checkout.validation.prescriptionRequired'));
      return;
    }

    if (!/^\d{10}$/.test(personalId)) {
      setPrescriptionError(t('checkout.validation.personalId'));
      return;
    }

    setPrescriptionError(null);
    setStep('form');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!items.length) {
      setError(t('checkout.validation.noItems'));
      return;
    }

    const trimmedEgn = formData.egn.trim();
    const trimmedPrescriptionCode = formData.prescriptionCode.trim();

    if (requiresPrescription) {
      if (step === 'eprescription') {
        if (!trimmedEgn) {
          setError(t('checkout.validation.egnRequired'));
          return;
        }

        if (!/^\d{10}$/.test(trimmedEgn)) {
          setError(t('checkout.validation.egnFormat'));
          return;
        }

        if (!trimmedPrescriptionCode) {
          setError(t('checkout.validation.prescriptionRequired'));
          return;
        }
      } else {
        if (!trimmedEgn) {
          setError(t('checkout.validation.egnRequired'));
          setStep('eprescription');
          return;
        }

        if (!/^\d{10}$/.test(trimmedEgn)) {
          setError(t('checkout.validation.egnFormat'));
          setStep('eprescription');
          return;
        }

        if (!trimmedPrescriptionCode) {
          setError(t('checkout.validation.prescriptionRequired'));
          setStep('eprescription');
          return;
        }
      }
    }

    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      setError(t('checkout.validation.missingSession'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const timestampIso = new Date().toISOString();

    const nhifPrescriptions = requiresPrescription
      ? [
          {
            prescriptionNumber: prescriptionData.prescriptionNumber.trim(),
            personalIdentificationNumber:
              prescriptionData.personalIdentificationNumber.trim(),
            prescribedDate: timestampIso,
            purchaseDate: timestampIso,
            patientPaidAmount: grandTotal,
            nhifPaidAmount: 0,
          },
        ]
      : undefined;

    const paymentMethod = mapPaymentMethod(formData.paymentMethod);

    const combinedNotes = [
      formData.notes.trim(),
      requiresPrescription
        ? `${t('checkout.prescription.egn')}: ${trimmedEgn}`
        : '',
      requiresPrescription
        ? `${t('checkout.prescription.code')}: ${trimmedPrescriptionCode}`
        : '',
    ]
      .filter((value) => Boolean(value))
      .join('\n');

    const payload = {
      customerName: formData.fullName.trim() || undefined,
      customerEmail: formData.email.trim() || undefined,
      phoneNumber: formData.phoneNumber.trim() || undefined,
      deliveryAddress: formData.address.trim() || undefined,
      city: formData.city.trim() || undefined,
      postalCode: formData.postalCode.trim() || undefined,
      country: formData.country.trim() || undefined,
      notes: combinedNotes || undefined,
      paymentMethod,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      nhifPrescriptions,
    };

    try {
      const response = await fetch(buildUrl('orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let body: CreateOrderResponse | null = null;
      try {
        body = (await response.json()) as CreateOrderResponse;
      } catch {
        body = null;
      }

      if (!response.ok || !body?.success) {
        throw new Error(body?.message || t('checkout.error.generic'));
      }

      if (body.order) {
        setCreatedOrder(body.order);
        onOrderCreated?.(body.order);
      }

      setStep('success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('checkout.error.generic');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolvedPaymentLabel = (value: PaymentMethod | number | undefined) => {
    const method = mapPaymentMethod(value);
    switch (method) {
      case 'Card':
        return t('checkout.payment.card');
      case 'BankTransfer':
        return t('checkout.payment.bankTransfer');
      default:
        return t('checkout.payment.cashOnDelivery');
    }
  };

  const SubmitIcon = (() => {
    if (requiresPrescription) {
      return step === 'eprescription' ? ArrowRight : CheckCircle2;
    }
    return CheckCircle2;
  })();

  const submitLabel = requiresPrescription
    ? step === 'eprescription'
      ? t('checkout.actions.continue')
      : t('checkout.actions.confirmCard')
    : t('checkout.actions.submit');

  const summarySection = (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">
        {t('checkout.section.summary')}
      </h3>
      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-medium text-slate-900">
                {formatCurrency(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 pt-3 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>{t('checkout.summary.subtotal')}</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>{t('checkout.summary.delivery')}</span>
            <span>
              {deliveryFee > 0
                ? formatCurrency(deliveryFee)
                : t('checkout.summary.free')}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-base font-semibold text-slate-900">
            <span>{t('checkout.summary.total')}</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="fixed inset-0 z-[70]" onClick={handleBackdropClick}>
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
      <div
        className="absolute inset-0 overflow-y-auto p-4 md:p-10"
        onClick={handleContentClick}
      >
        <div className="mx-auto flex max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 md:px-8">
            <div>
              <div className="flex items-center space-x-2 text-emerald-600">
                <CreditCard className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {t('checkout.title')}
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-display font-semibold text-slate-900">
                {t('checkout.subtitle')}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) {
                  onClose();
                }
              }}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {step === 'prescription' ? (
            <form onSubmit={handlePrescriptionSubmit} className="space-y-6 p-6 md:px-8 md:py-6">
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {t('checkout.section.prescription')}
                </h3>
                <p className="text-sm text-slate-600">
                  {t('checkout.prescription.subtitle')}
                </p>
                <p className="text-xs text-slate-400">
                  {t('checkout.prescription.privacy')}
                </p>
                {prescriptionError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {prescriptionError}
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="checkout-personal-id"
                      className="text-sm font-medium text-slate-600"
                    >
                      {t('checkout.field.personalId')}
                    </label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="checkout-personal-id"
                        name="personalIdentificationNumber"
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        autoComplete="off"
                        value={prescriptionData.personalIdentificationNumber}
                        onChange={handlePrescriptionInputChange}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="checkout-prescription-number"
                      className="text-sm font-medium text-slate-600"
                    >
                      {t('checkout.field.prescriptionNumber')}
                    </label>
                    <div className="relative">
                      <ClipboardList className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="checkout-prescription-number"
                        name="prescriptionNumber"
                        type="text"
                        autoComplete="off"
                        value={prescriptionData.prescriptionNumber}
                        onChange={handlePrescriptionInputChange}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={() => !isSubmitting && onClose()}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {t('checkout.actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {t('checkout.actions.prescriptionContinue')}
                </button>
              </div>
            </form>
          ) : step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-6 p-6 md:px-8 md:py-6">
              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <section className="space-y-6">
                  <section className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="checkout-name"
                          className="text-sm font-medium text-slate-600"
                        >
                          {t('checkout.field.fullName')}
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id="checkout-name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="checkout-email"
                          className="text-sm font-medium text-slate-600"
                        >
                          {t('checkout.field.email')}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id="checkout-email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="checkout-phone"
                          className="text-sm font-medium text-slate-600"
                        >
                          {t('checkout.field.phone')}
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id="checkout-phone"
                            name="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {t('checkout.section.delivery')}
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="checkout-address"
                          className="text-sm font-medium text-slate-600"
                        >
                          {t('checkout.field.address')}
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id="checkout-address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <label
                            htmlFor="checkout-city"
                            className="text-sm font-medium text-slate-600"
                          >
                            {t('checkout.field.city')}
                          </label>
                          <input
                            id="checkout-city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="checkout-postal"
                            className="text-sm font-medium text-slate-600"
                          >
                            {t('checkout.field.postalCode')}
                          </label>
                          <input
                            id="checkout-postal"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="checkout-country"
                            className="text-sm font-medium text-slate-600"
                          >
                            {t('checkout.field.country')}
                          </label>
                          <input
                            id="checkout-country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="checkout-notes"
                        className="text-sm font-medium text-slate-600"
                      >
                        {t('checkout.field.notes')}
                      </label>
                      <textarea
                        id="checkout-notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </section>

                  {requiresPrescription && (
                    <section className="space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {t('checkout.prescription.stepTitle')}
                      </h3>
                      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                        <FileText className="mt-0.5 h-5 w-5" />
                        <div>
                          <p className="text-sm">
                            {t('checkout.prescription.stepSubtitle')}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="checkout-egn"
                            className="text-sm font-medium text-slate-600"
                          >
                            {t('checkout.prescription.egn')}
                          </label>
                          <input
                            id="checkout-egn"
                            name="egn"
                            value={formData.egn}
                            onChange={handleInputChange}
                            inputMode="numeric"
                            maxLength={10}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="checkout-prescription"
                            className="text-sm font-medium text-slate-600"
                          >
                            {t('checkout.prescription.code')}
                          </label>
                          <input
                            id="checkout-prescription"
                            name="prescriptionCode"
                            value={formData.prescriptionCode}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {t('checkout.section.payment')}
                    </h3>
                    <div className="grid gap-3 md:grid-cols-3">
                      {PAYMENT_METHODS.map((method) => {
                        const label = resolvedPaymentLabel(method);
                        const isActive = formData.paymentMethod === method;
                        const isDisabled = requiresPrescription && method !== 'Card';
                        const baseClasses = isActive
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700';
                        const disabledClasses = isDisabled
                          ? 'cursor-not-allowed opacity-60 hover:border-slate-200 hover:text-slate-600'
                          : '';
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => handlePaymentChange(method)}
                            disabled={isDisabled}
                            className={`rounded-2xl border px-4 py-3 text-sm transition ${baseClasses} ${disabledClasses}`.trim()}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="space-y-1 text-xs text-slate-500">
                      <p>{t('checkout.paymentUnavailable')}</p>
                      {requiresPrescription && (
                        <p className="text-amber-600">
                          {t('checkout.prescription.cardOnly')}
                        </p>
                      )}
                    </div>
                  </section>
                </section>

                <div className="space-y-6">{summarySection}</div>
              </div>

              <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
                {requiresPrescription && (
                  <button
                    type="button"
                    onClick={() => !isSubmitting && setStep('eprescription')}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSubmitting}
                  >
                    {t('checkout.actions.back')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => !isSubmitting && onClose()}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {t('checkout.actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SubmitIcon className="mr-2 h-4 w-4" />
                  )}
                  <span>{submitLabel}</span>
                </button>
              </div>
            </form>
          ) : step === 'eprescription' ? (
            <form onSubmit={handleSubmit} className="space-y-6 p-6 md:px-8 md:py-6">
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">
                  {t('checkout.prescription.stepTitle')}
                </h3>
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                  <FileText className="mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-sm">
                      {t('checkout.prescription.stepSubtitle')}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="checkout-egn-confirm"
                      className="text-sm font-medium text-slate-600"
                    >
                      {t('checkout.prescription.egn')}
                    </label>
                    <input
                      id="checkout-egn-confirm"
                      name="egn"
                      value={formData.egn}
                      onChange={handleInputChange}
                      inputMode="numeric"
                      maxLength={10}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="checkout-prescription-confirm"
                      className="text-sm font-medium text-slate-600"
                    >
                      {t('checkout.prescription.code')}
                    </label>
                    <input
                      id="checkout-prescription-confirm"
                      name="prescriptionCode"
                      value={formData.prescriptionCode}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">
                  {t('checkout.section.payment')}
                </h3>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-slate-700">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold">
                      {t('checkout.prescription.cardOnly')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t('checkout.prescription.cardDisclaimer')}
                    </p>
                  </div>
                </div>
              </section>

              {summarySection}

              <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={() => !isSubmitting && setStep('form')}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {t('checkout.actions.back')}
                </button>
                <button
                  type="button"
                  onClick={() => !isSubmitting && onClose()}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {t('checkout.actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SubmitIcon className="mr-2 h-4 w-4" />
                  )}
                  <span>{submitLabel}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 p-6 md:px-8 md:py-6">
              <div className="flex items-start space-x-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">{t('checkout.success.title')}</p>
                  <p className="text-sm">{t('checkout.success.message')}</p>
                </div>
              </div>

              {createdOrder && (
                <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {t('orders.detail.orderNumber')}
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {createdOrder.orderNumber}
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-500">
                        {t('orders.detail.paymentMethod')}
                      </p>
                      <p className="text-sm text-slate-900">
                        {resolvedPaymentLabel(createdOrder.paymentMethod)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-500">
                        {t('orders.detail.total')}
                      </p>
                      <p className="text-sm text-slate-900">
                        {formatCurrency(
                          createdOrder.grandTotal ??
                            createdOrder.total + createdOrder.deliveryFee,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-500">
                      {t('orders.detail.items')}
                    </p>
                    <div className="space-y-1 text-sm">
                      {createdOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-slate-600"
                        >
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
              )}

              <p className="text-sm text-slate-500">
                {t('checkout.success.hint')}
              </p>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  {t('checkout.success.close')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
