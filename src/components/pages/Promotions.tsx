import React, { useMemo } from 'react';
import { Tag, Clock, Gift, Percent } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import ProductGrid from '../ProductGrid';
import { useFeatureToggles } from '../../context/FeatureToggleContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';

const Promotions: React.FC = () => {
  const { t } = useLanguage();
  const { prescriptionFeaturesEnabled } = useFeatureToggles();
  const { products } = useProductCatalog();

  const promotedProducts = useMemo(
    () =>
      products
        .filter(
          (product) =>
            Boolean(product.promotion) &&
            (prescriptionFeaturesEnabled || !product.requiresPrescription)
        )
        .sort((a, b) => {
          const timeA = a.promotion?.validUntil
            ? new Date(a.promotion.validUntil).getTime()
            : Number.POSITIVE_INFINITY;
          const timeB = b.promotion?.validUntil
            ? new Date(b.promotion.validUntil).getTime()
            : Number.POSITIVE_INFINITY;
          return timeA - timeB;
        }),
    [prescriptionFeaturesEnabled, products]
  );

  const { count, savings, averageDiscount, highestDiscount } = useMemo(() => {
    const count = promotedProducts.length;
    if (count === 0) {
      return { count, savings: 0, averageDiscount: 0, highestDiscount: 0 };
    }

    let totalSavings = 0;
    let totalDiscount = 0;
    let maxDiscount = 0;

    promotedProducts.forEach((product) => {
      const promotion = product.promotion;
      if (!promotion) {
        return;
      }

      totalSavings += product.price - promotion.promoPrice;
      const computedDiscount =
        promotion.discountPercentage ??
        (product.price > 0
          ? Math.round(((product.price - promotion.promoPrice) / product.price) * 100)
          : 0);
      totalDiscount += computedDiscount;
      if (computedDiscount > maxDiscount) {
        maxDiscount = computedDiscount;
      }
    });

    return {
      count,
      savings: totalSavings,
      averageDiscount: Math.round(totalDiscount / count),
      highestDiscount: maxDiscount,
    };
  }, [promotedProducts]);

  const formatCurrency = (value: number) => `€${value.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 space-y-12">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            {t('promotions.currentCount', { count })}
          </span>
          <h1 className="text-4xl font-bold text-gray-900">{t('footer.promotions')}</h1>
          <p className="text-lg text-gray-600">{t('promotions.description')}</p>
        </header>

        {count > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="flex items-center space-x-3 text-emerald-600">
                <Tag className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {t('promotions.activeOffers')}
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600">{t('promotions.currentCount', { count })}</p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex items-center space-x-3 text-blue-600">
                <Percent className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {t('promotions.averageDiscount')}
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900">{averageDiscount}%</p>
              <p className="text-sm text-gray-600">
                {t('promotions.highestDiscount', { value: highestDiscount })}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <div className="flex items-center space-x-3 text-amber-600">
                <Gift className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {t('promotions.estimatedSavings')}
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900">{formatCurrency(savings)}</p>
              <div className="mt-3 flex items-center space-x-2 text-sm text-amber-600">
                <Clock className="w-4 h-4" />
                <span>{t('promotions.limitedStock')}</span>
              </div>
            </div>
          </div>
        )}

        {count > 0 ? (
          <ProductGrid products={promotedProducts} />
        ) : (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-12 text-center text-emerald-700 font-semibold">
            {t('promotions.noActive')}
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Tag className="w-6 h-6 mr-3 text-primary-600" />
            {t('promotions.howToUse')}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('promotions.step1')}</h3>
              <p className="text-gray-600 text-sm">{t('promotions.step1Desc')}</p>
            </div>

            <div className="text-center">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-secondary-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('promotions.step2')}</h3>
              <p className="text-gray-600 text-sm">{t('promotions.step2Desc')}</p>
            </div>

            <div className="text-center">
              <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('promotions.step3')}</h3>
              <p className="text-gray-600 text-sm">{t('promotions.step3Desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;
