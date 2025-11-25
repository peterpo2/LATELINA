import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar,
  Info,
  MessageCircle,
  Package,
  Shield,
  ShoppingCart,
  Tag,
} from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useFeatureToggles } from '../../context/FeatureToggleContext';
import { useCart } from '../../context/CartContext';
import { useChat } from '../../context/ChatContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';

const ProductMoreInfoPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { prescriptionFeaturesEnabled } = useFeatureToggles();
  const { dispatch } = useCart();
  const { askAssistant } = useChat();
  const { products } = useProductCatalog();

  const product: Product | undefined = useMemo(
    () => products.find((item) => item.id === Number(productId)),
    [productId, products],
  );

  const getProductName = (currentProduct: Product) =>
    language === 'bg' ? currentProduct.name : currentProduct.nameEn;
  const getDescription = (currentProduct: Product) =>
    language === 'bg'
      ? currentProduct.description ?? ''
      : currentProduct.descriptionEn ?? currentProduct.description ?? '';
  const getActiveIngredient = (currentProduct: Product) =>
    language === 'bg'
      ? currentProduct.activeIngredient
      : currentProduct.activeIngredientEn ?? currentProduct.activeIngredient;
  const getDosage = (currentProduct: Product) =>
    language === 'bg' ? currentProduct.dosage : currentProduct.dosageEn ?? currentProduct.dosage;
  const getManufacturer = (currentProduct: Product) =>
    language === 'bg'
      ? currentProduct.manufacturer
      : currentProduct.manufacturerEn ?? currentProduct.manufacturer;

  const handleAddToCart = (currentProduct: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: currentProduct });
  };

  const handleAskAI = (currentProduct: Product) => {
    const productName = getProductName(currentProduct);
    const question = language === 'bg' ? `Разкажете ми за ${productName}` : `Tell me about ${productName}`;
    if (currentProduct.id) {
      void askAssistant(question, currentProduct.id);
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-16 text-center">
          <Info className="h-12 w-12 text-emerald-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">{t('products.moreInfoNotFoundTitle')}</h1>
          <p className="mt-3 max-w-xl text-gray-600">{t('products.moreInfoNotFoundDescription')}</p>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="mt-8 inline-flex items-center space-x-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-emerald-700"
          >
            <span>{t('products.viewAll')}</span>
          </button>
        </div>
      </div>
    );
  }

  const hasPromotion = Boolean(product.promotion);
  const displayPrice = hasPromotion ? product.promotion!.promoPrice : product.price;
  const discountPercentage = product.promotion?.discountPercentage;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex items-center justify-center overflow-hidden rounded-3xl bg-white p-6 shadow-xl">
            <img
              src={product.imageUrl}
              alt={getProductName(product)}
              className="max-h-[28rem] w-full max-w-[28rem] rounded-2xl object-cover"
            />
          </div>

          <div className="flex flex-col space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                {t('products.productDetails')}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{getProductName(product)}</h1>
              {product.rating !== undefined && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="font-semibold text-emerald-600">{product.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>
                    {product.reviewCount ?? 0} {t('products.reviews')}
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-700">{t('products.descriptionLabel')}</p>
              <p className="mt-3 text-gray-600">{getDescription(product)}</p>
            </div>

            <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2">
              {getActiveIngredient(product) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('products.activeIngredient')}
                  </p>
                  <p className="mt-1 font-medium text-gray-900">{getActiveIngredient(product)}</p>
                </div>
              )}
              {getDosage(product) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('products.dosage')}</p>
                  <p className="mt-1 font-medium text-gray-900">{getDosage(product)}</p>
                </div>
              )}
              {getManufacturer(product) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('products.manufacturer')}
                  </p>
                  <p className="mt-1 font-medium text-gray-900">{getManufacturer(product)}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('products.stockStatus')}</p>
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
              {prescriptionFeaturesEnabled && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('products.prescriptionRequiredLabel')}
                  </p>
                  <p className="mt-1 flex items-center space-x-2 font-medium text-gray-900">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span>
                      {product.requiresPrescription ? t('products.prescription') : t('products.overTheCounter')}
                    </span>
                  </p>
                </div>
              )}
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

            <div className="rounded-3xl bg-emerald-50 p-6">
              <div className="flex flex-wrap items-baseline gap-3">
                {hasPromotion && (
                  <span className="text-sm text-gray-500 line-through">€{product.price.toFixed(2)}</span>
                )}
                <span className="text-3xl font-bold text-emerald-600">€{displayPrice.toFixed(2)}</span>
                {discountPercentage && discountPercentage > 0 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    -{discountPercentage}%
                  </span>
                )}
                {hasPromotion && (
                  <span className="inline-flex items-center space-x-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <Tag className="h-4 w-4" />
                    <span>{language === 'bg' ? product.promotion!.title : product.promotion!.titleEn}</span>
                  </span>
                )}
              </div>
              {product.promotion?.description && (
                <p className="mt-3 text-sm text-emerald-700">
                  {language === 'bg' ? product.promotion.description : product.promotion.descriptionEn}
                </p>
              )}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className="flex flex-1 items-center justify-center space-x-2 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-emerald-700"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>{t('products.add')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAI(product)}
                  className="flex flex-1 items-center justify-center space-x-2 rounded-2xl border border-emerald-200 px-6 py-3 font-semibold text-emerald-600 transition hover:scale-[1.02] hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{t('products.askAssistant')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 space-y-4 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('products.moreInfoTitle')}</h2>
              <p className="text-sm text-gray-600">{t('products.moreInfoSubtitle')}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-gray-600">
            {t('products.moreInfoPlaceholder')}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductMoreInfoPage;
