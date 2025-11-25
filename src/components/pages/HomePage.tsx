import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import HeroSection from '../HeroSection';
import CategoryFilter from '../CategoryFilter';
import ProductGrid from '../ProductGrid';
import { useLanguage } from '../../context/LanguageContext';
import { Category, Product } from '../../types';
import { getCategoryDisplayName, getCategoryIcon } from '../../utils/categories';

interface HomePageProps {
  searchTerm: string;
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  filteredProducts: Product[];
  categories: Category[];
  showHero: boolean;
  allProducts: Product[];
}

const HomePage: React.FC<HomePageProps> = ({
  searchTerm,
  selectedCategory,
  onCategoryChange,
  filteredProducts,
  categories,
  showHero,
  allProducts,
}) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const promotedProducts = useMemo(
    () => allProducts.filter((product) => Boolean(product.promotion)),
    [allProducts]
  );

  const selectedCategoryEntity = selectedCategory
    ? categories.find((category) => category.id === selectedCategory)
    : undefined;
  const selectedCategoryLabel = selectedCategoryEntity
    ? getCategoryDisplayName(selectedCategoryEntity, language)
    : t('products.unknown');

  const resultsTitle = searchTerm
    ? `${t('products.resultsFor')} "${searchTerm}"`
    : selectedCategory
    ? `${t('products.category')}: ${selectedCategoryLabel}`
    : t('products.allProducts');

  const showPreview = showHero;
  const previewCategories = categories.slice(0, 4);
  const previewProducts = allProducts.slice(0, 4);
  const previewPromotions = promotedProducts.slice(0, 4);

  const handleViewAllCategories = () => {
    navigate('/categories');
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  const handleViewAllPromotions = () => {
    navigate('/promotions');
  };

  return (
    <div className="bg-gray-50">
      {showHero && <HeroSection />}

      <main className="container mx-auto px-4 py-8 bg-white min-h-screen">
        {showPreview ? (
          <>
            <section className="mb-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{t('categories.title')}</h2>
                  <p className="text-gray-600">{t('categories.previewSubtitle')}</p>
                </div>
                <button
                  type="button"
                  onClick={handleViewAllCategories}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-emerald-200 text-sm font-semibold text-emerald-700 hover:border-emerald-300 hover:text-emerald-800 transition-colors"
                >
                  {t('categories.viewAll')}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {previewCategories.map((category) => {
                  const IconComponent = getCategoryIcon(category.icon);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => onCategoryChange(category.id)}
                      className="text-left bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 rounded-2xl p-5 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-100">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {getCategoryDisplayName(category, language)}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{category.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mb-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{t('home.promotionsTitle')}</h2>
                  <p className="text-gray-600">{t('home.promotionsSubtitle')}</p>
                </div>
                <button
                  type="button"
                  onClick={handleViewAllPromotions}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-emerald-200 text-sm font-semibold text-emerald-700 hover:border-emerald-300 hover:text-emerald-800 transition-colors"
                >
                  {t('home.promotionsViewAll')}
                </button>
              </div>
              {previewPromotions.length > 0 ? (
                <ProductGrid
                  products={previewPromotions}
                  onEmptyAction={handleViewAllPromotions}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">
                  {t('home.promotionsEmpty')}
                </div>
              )}
            </section>

            <section>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{t('products.featuredTitle')}</h2>
                  <p className="text-gray-600">{t('products.featuredSubtitle')}</p>
                </div>
                <button
                  type="button"
                  onClick={handleViewAllProducts}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-emerald-200 text-sm font-semibold text-emerald-700 hover:border-emerald-300 hover:text-emerald-800 transition-colors"
                >
                  {t('products.viewAll')}
                </button>
              </div>
              <ProductGrid
                products={previewProducts}
                isLoading={false}
                onEmptyAction={handleViewAllProducts}
              />
            </section>
          </>
        ) : (
          <>
            <section id="category-filter">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                categories={categories}
              />
            </section>

            {(searchTerm || selectedCategory) && (
              <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{resultsTitle}</h2>
                <p className="text-gray-600 flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                    {filteredProducts.length} {t('products.products')}
                  </span>
                </p>
              </div>
            )}

            <ProductGrid
              products={filteredProducts}
              isLoading={false}
              onEmptyAction={handleViewAllProducts}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;
