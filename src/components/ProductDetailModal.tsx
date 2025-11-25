import React, { useEffect } from 'react';
import {
  X,
  Shield,
  Package,
  ShoppingCart,
  MessageCircle,
  Tag,
  Calendar,
  Info,
} from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useChat } from '../context/ChatContext';
import { useFeatureToggles } from '../context/FeatureToggleContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { t, language } = useLanguage();
  const { dispatch } = useCart();
  const { askAssistant } = useChat();
  const { prescriptionFeaturesEnabled } = useFeatureToggles();

  const getProductName = () => (language === 'bg' ? product.name : product.nameEn);
  const getDescription = () =>
    language === 'bg' ? product.description ?? '' : product.descriptionEn ?? product.description ?? '';
  const getActiveIngredient = () =>
    language === 'bg' ? product.activeIngredient : product.activeIngredientEn ?? product.activeIngredient;
  const getDosage = () => (language === 'bg' ? product.dosage : product.dosageEn ?? product.dosage);
  const getManufacturer = () =>
    language === 'bg' ? product.manufacturer : product.manufacturerEn ?? product.manufacturer;

  const hasPromotion = Boolean(product.promotion);
  const displayPrice = hasPromotion ? product.promotion!.promoPrice : product.price;
  const discountPercentage = product.promotion?.discountPercentage;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const handleAskAI = () => {
    const productName = getProductName();
    const question =
      language === 'bg' ? `Разкажете ми за ${productName}` : `Tell me about ${productName}`;

    if (product.id) {
      void askAssistant(question, product.id);
    }
  };

  const handleOpenMoreInfo = () => {
    if (product.id) {
      window.open(`/products/${product.id}/info`, '_blank', 'noopener,noreferrer');
    }
  };

  const formatPromotionDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(language === 'bg' ? 'bg-BG' : 'en-GB', {
      dateStyle: 'medium',
    }).format(date);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div className="relative grid w-full max-w-5xl gap-6 overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-[1.1fr_1fr]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-500 shadow-md transition hover:scale-105 hover:text-gray-700"
          aria-label={t('common.close')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative bg-gray-50">
          <img
            src={product.imageUrl}
            alt={getProductName()}
            className="h-full w-full object-cover"
          />
          {product.requiresPrescription && prescriptionFeaturesEnabled && (
            <div className="absolute left-4 top-4 flex items-center space-x-2 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              <Shield className="h-3.5 w-3.5" />
              <span>{t('products.prescription')}</span>
            </div>
          )}
          {hasPromotion && (
            <div className="absolute bottom-4 left-4 flex items-center space-x-2 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              <Tag className="h-4 w-4" />
              <span>
                {discountPercentage && discountPercentage > 0
                  ? `-${discountPercentage}%`
                  : language === 'bg'
                  ? product.promotion!.title
                  : product.promotion!.titleEn}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-6 p-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
              {t('products.productDetails')}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">{getProductName()}</h2>
            {product.reviewCount !== undefined && product.reviewCount > 0 && (
              <div className="mt-3 text-sm text-gray-500">
                <span>{product.reviewCount} {t('products.reviews')}</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700">{t('products.descriptionLabel')}</p>
            <p className="mt-2 text-gray-600">{getDescription()}</p>
          </div>

          <div className="grid gap-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-2">
            {getActiveIngredient() && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t('products.activeIngredient')}
                </p>
                <p className="mt-1 font-medium text-gray-900">{getActiveIngredient()}</p>
              </div>
            )}
            {getDosage() && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t('products.dosage')}
                </p>
                <p className="mt-1 font-medium text-gray-900">{getDosage()}</p>
              </div>
            )}
            {getManufacturer() && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t('products.manufacturer')}
                </p>
                <p className="mt-1 font-medium text-gray-900">{getManufacturer()}</p>
              </div>
            )}
            {prescriptionFeaturesEnabled && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t('products.prescriptionRequiredLabel')}
                </p>
                <p className="mt-1 font-medium text-gray-900">
                  {product.requiresPrescription ? t('products.prescription') : t('products.overTheCounter')}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('products.stockStatus')}
              </p>
              <p className="mt-1 flex items-center space-x-2 font-medium text-gray-900">
                <Package className="h-4 w-4 text-emerald-500" />
                <span>
                  {product.stockQuantity > 10
                    ? t('products.inStock')
                    : product.stockQuantity > 0
                    ? `${product.stockQuantity} ${t('products.pieces')}`
                    : t('products.outOfStock')}
                </span>
              </p>
            </div>
            {product.promotion?.validUntil && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t('products.promotionValidUntil')}
                </p>
                <p className="mt-1 flex items-center space-x-2 font-medium text-gray-900">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <span>{formatPromotionDate(product.promotion.validUntil)}</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-3 rounded-2xl bg-emerald-50 p-4">
            <div className="flex items-baseline space-x-3">
              {hasPromotion && (
                <span className="text-sm text-gray-500 line-through">€{product.price.toFixed(2)}</span>
              )}
              <span className="text-3xl font-bold text-emerald-600">€{displayPrice.toFixed(2)}</span>
              {discountPercentage && discountPercentage > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  -{discountPercentage}%
                </span>
              )}
            </div>
            {product.promotion?.description && (
              <p className="text-sm text-emerald-700">
                {language === 'bg' ? product.promotion.description : product.promotion.descriptionEn}
              </p>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center space-x-2 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-emerald-700"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{t('products.add')}</span>
            </button>
            <button
              type="button"
              onClick={handleAskAI}
              className="flex flex-1 items-center justify-center space-x-2 rounded-2xl border border-emerald-200 px-6 py-3 font-semibold text-emerald-600 transition hover:scale-[1.02] hover:border-emerald-300 hover:bg-emerald-50"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{t('products.askAssistant')}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenMoreInfo}
              className="flex flex-1 items-center justify-center space-x-2 rounded-2xl border border-transparent px-6 py-3 font-semibold text-emerald-600 transition hover:scale-[1.02] hover:bg-emerald-50"
            >
              <Info className="h-5 w-5" />
              <span>{t('products.moreInfo')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
