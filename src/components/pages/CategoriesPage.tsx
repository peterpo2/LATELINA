import React, { useMemo } from 'react';
import { ArrowRightCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../context/LanguageContext';
import { Category, Product } from '../../types';
import { getCategoryDisplayName, getCategoryIcon } from '../../utils/categories';

interface CategoriesPageProps {
  categories: Category[];
  products: Product[];
  onCategorySelect: (categoryId: number | null) => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ categories, products, onCategorySelect }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const categorySummaries = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        translatedName: getCategoryDisplayName(category, language),
        count: products.filter((product) => product.categoryId === category.id).length,
      })),
    [categories, language, products],
  );

  const handleCategoryClick = (categoryId: number) => {
    onCategorySelect(categoryId);
  };

  const handleViewAllProducts = () => {
    onCategorySelect(null);
    navigate('/products');
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 space-y-12">
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-12">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">{t('categories.title')}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">{t('categories.subtitle')}</p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
              {categories.length} {t('categories.title').toLowerCase()}
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-sky-50 text-sky-700 font-semibold">
              {products.length} {t('products.products')}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorySummaries.map((category) => {
            const IconComponent = getCategoryIcon(category.icon);

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                className="text-left bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 rounded-2xl p-6 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {category.count} {t('products.products')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.translatedName}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{category.description}</p>
                <span className="inline-flex items-center text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
                  {t('categories.viewProducts')}
                  <ArrowRightCircle className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
            );
          })}
        </section>

        <section className="text-center">
          <button
            type="button"
            onClick={handleViewAllProducts}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
          >
            {t('products.viewAll')}
          </button>
        </section>
      </div>
    </div>
  );
};

export default CategoriesPage;
