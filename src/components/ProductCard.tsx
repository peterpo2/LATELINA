import React from 'react';
import { ShoppingCart, MessageCircle, Shield, Heart, Package } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useChat } from '../context/ChatContext';
import { useLanguage } from '../context/LanguageContext';
import { useFeatureToggles } from '../context/FeatureToggleContext';

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const { dispatch } = useCart();
  const { askAssistant } = useChat();
  const { language, t } = useLanguage();
  const { prescriptionFeaturesEnabled } = useFeatureToggles();

  const promotion = product.promotion;
  const hasPromotion = Boolean(promotion);
  const displayPrice = hasPromotion ? promotion!.promoPrice : product.price;
  const computedDiscount =
    hasPromotion && product.price > 0
      ? Math.round(((product.price - promotion!.promoPrice) / product.price) * 100)
      : 0;
  const discountPercentage = promotion?.discountPercentage ?? computedDiscount;

  const promotionTitle = hasPromotion
    ? language === 'bg'
      ? promotion!.title
      : promotion!.titleEn
    : '';
  const promotionDescription = hasPromotion
    ? language === 'bg'
      ? promotion!.description
      : promotion!.descriptionEn
    : '';

  const formatPromotionDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(language === 'bg' ? 'bg-BG' : 'en-GB', {
      dateStyle: 'medium',
    }).format(date);
  };

  const getPromotionBadgeClasses = (color?: string) => {
    const colors = {
      emerald: 'bg-emerald-100 text-emerald-700',
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
      pink: 'bg-pink-100 text-pink-700',
    } as const;

    return colors[color as keyof typeof colors] ?? 'bg-emerald-100 text-emerald-700';
  };

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const handleAskAI = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const productName = language === 'bg' ? product.name : product.nameEn;
    const question =
      language === 'bg' ? `Разкажете ми за ${productName}` : `Tell me about ${productName}`;

    if (product.id) {
      void askAssistant(question, product.id);
    }
  };

  const getProductName = () => (language === 'bg' ? product.name : product.nameEn);
  const getActiveIngredient = () =>
    language === 'bg' ? product.activeIngredient : product.activeIngredientEn;
  const getDosage = () => (language === 'bg' ? product.dosage : product.dosageEn);
  const getManufacturer = () =>
    language === 'bg' ? product.manufacturer : product.manufacturerEn;

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {onProductClick && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleProductClick();
            }}
            className="absolute inset-0 z-10 h-full w-full"
            aria-label={t('products.viewDetails')}
          />
        )}
        <img
          src={product.imageUrl}
          alt={getProductName()}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col space-y-2">
          {product.requiresPrescription && prescriptionFeaturesEnabled && (
            <div className="flex items-center space-x-1 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
              <Shield className="h-3 w-3" />
              <span>{t('products.prescription')}</span>
            </div>
          )}
          {hasPromotion && (
            <div
              className={`rounded-full px-2 py-1 text-xs font-semibold shadow-sm ${getPromotionBadgeClasses(
                promotion?.badgeColor,
              )}`}
            >
              {discountPercentage && discountPercentage > 0
                ? `-${discountPercentage}%`
                : promotionTitle}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-2 opacity-0 shadow-md transition-all duration-300 hover:scale-110 hover:bg-white group-hover:opacity-100"
        >
          <Heart className="h-4 w-4 text-gray-600 transition-colors duration-200 hover:text-red-500" />
        </button>

        {/* Stock indicator */}
        <div
          className={`absolute bottom-3 left-3 rounded-full px-2 py-1 text-xs font-medium ${
            product.stockQuantity > 10
              ? 'bg-green-100 text-green-800'
              : product.stockQuantity > 0
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <Package className="mr-1 inline h-3 w-3" />
          {product.stockQuantity > 10
            ? t('products.inStock')
            : product.stockQuantity > 0
            ? `${product.stockQuantity} ${t('products.pieces')}`
            : t('products.outOfStock')}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 min-h-0 flex-col p-4">
        {/* Title */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleProductClick();
          }}
          className="mb-2 line-clamp-2 w-full text-left text-sm font-semibold text-gray-900 transition-colors duration-300 group-hover:text-emerald-600"
        >
          {getProductName()}
        </button>

        {/* Price */}
        <div className="mb-3">
          {hasPromotion ? (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 line-through">
                  €{product.price.toFixed(2)}
                </span>
                {discountPercentage > 0 && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                    -{discountPercentage}%
                  </span>
                )}
              </div>
              <span className="text-xl font-bold text-emerald-600">
                €{displayPrice.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-emerald-600">
              €{displayPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto pr-1 text-sm text-gray-600">
            <div className="space-y-1">
              {getActiveIngredient() && (
                <p>
                  <span className="font-medium">{t('products.activeIngredient')}:</span>{' '}
                  {getActiveIngredient()}
                </p>
              )}
              {getDosage() && (
                <p>
                  <span className="font-medium">{t('products.dosage')}:</span>{' '}
                  {getDosage()}
                </p>
              )}
              {getManufacturer() && (
                <p>
                  <span className="font-medium">{t('products.manufacturer')}:</span>{' '}
                  {getManufacturer()}
                </p>
              )}
            </div>

            {hasPromotion && (
              <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
                <p className="font-semibold">{promotionTitle}</p>
                {promotionDescription && (
                  <p className="mt-1 text-[11px] text-emerald-600">
                    {promotionDescription}
                  </p>
                )}
                {promotion?.validUntil && (
                  <p className="mt-2 text-[11px] font-medium text-emerald-500">
                    {t('promotions.validUntil')}: {formatPromotionDate(promotion.validUntil)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            type="button"
            className="group/btn flex flex-1 items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <ShoppingCart className="h-4 w-4 transition-transform duration-300 group-hover/btn:scale-110" />
            <span>{t('products.add')}</span>
          </button>

          <button
            onClick={handleAskAI}
            type="button"
            className="rounded-xl bg-gray-100 p-3 text-gray-600 transition-all duration-300 hover:scale-110 hover:bg-emerald-100 hover:text-emerald-600"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
