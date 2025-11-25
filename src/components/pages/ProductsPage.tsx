import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, RotateCcw, Search, SlidersHorizontal, Tag } from 'lucide-react';

import ProductGrid from '../ProductGrid';
import { useLanguage } from '../../context/LanguageContext';
import { Category, Product } from '../../types';
import { getCategoryDisplayName, getCategoryIcon } from '../../utils/categories';
import { useFeatureToggles } from '../../context/FeatureToggleContext';

interface ProductsPageProps {
  searchTerm: string;
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  filteredProducts: Product[];
  categories: Category[];
  allProducts: Product[];
}

type AvailabilityFilter = 'all' | 'inStock' | 'outOfStock';
type PrescriptionFilter = 'all' | 'requires' | 'otc';
type SortOption = 'relevance' | 'priceAsc' | 'priceDesc';

const ProductsPage: React.FC<ProductsPageProps> = ({
  searchTerm,
  selectedCategory,
  onCategoryChange,
  filteredProducts,
  categories,
  allProducts,
}) => {
  const { t, language } = useLanguage();
  const { prescriptionFeaturesEnabled } = useFeatureToggles();

  const categorySummaries = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        translatedName: getCategoryDisplayName(category, language),
        count: allProducts.filter((product) => product.categoryId === category.id).length,
      })),
    [allProducts, categories, language],
  );

  const priceBounds = useMemo(() => {
    if (!allProducts.length) {
      return { min: 0, max: 0 };
    }

    const prices = allProducts.map((product) => product.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [allProducts]);

  const [localSearch, setLocalSearch] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>(() => [priceBounds.min, priceBounds.max]);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [prescriptionFilter, setPrescriptionFilter] = useState<PrescriptionFilter>('all');
  const [onlyPromotions, setOnlyPromotions] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');

  useEffect(() => {
    setPriceRange([priceBounds.min, priceBounds.max]);
  }, [priceBounds.min, priceBounds.max]);

  useEffect(() => {
    if (!prescriptionFeaturesEnabled) {
      setPrescriptionFilter('all');
    }
  }, [prescriptionFeaturesEnabled]);

  const visibleProducts = useMemo(() => {
    const [minPrice, maxPrice] = priceRange;
    const searchQuery = localSearch.trim().toLowerCase();

    const filtered = filteredProducts.filter((product) => {
      if (product.price < minPrice || product.price > maxPrice) {
        return false;
      }

      if (availabilityFilter === 'inStock' && product.stockQuantity <= 0) {
        return false;
      }

      if (availabilityFilter === 'outOfStock' && product.stockQuantity > 0) {
        return false;
      }

      if (prescriptionFeaturesEnabled) {
        if (prescriptionFilter === 'requires' && !product.requiresPrescription) {
          return false;
        }

        if (prescriptionFilter === 'otc' && product.requiresPrescription) {
          return false;
        }
      }

      if (onlyPromotions && !product.promotion) {
        return false;
      }

      if (searchQuery) {
        const name = (language === 'bg' ? product.name : product.nameEn ?? product.name).toLowerCase();
        const description = (
          language === 'bg'
            ? product.description ?? ''
            : product.descriptionEn ?? product.description ?? ''
        ).toLowerCase();

        if (!name.includes(searchQuery) && !description.includes(searchQuery)) {
          return false;
        }
      }

      return true;
    });

    if (sortOption === 'priceAsc') {
      return [...filtered].sort((a, b) => a.price - b.price);
    }

    if (sortOption === 'priceDesc') {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [
    availabilityFilter,
    filteredProducts,
    language,
    localSearch,
    onlyPromotions,
    prescriptionFilter,
    priceRange,
    prescriptionFeaturesEnabled,
    sortOption,
  ]);

  const hasActiveFilters = useMemo(() => {
    const [minPrice, maxPrice] = priceRange;
    const defaultRange = priceBounds.min === minPrice && priceBounds.max === maxPrice;

    return (
      Boolean(searchTerm.trim()) ||
      Boolean(localSearch.trim()) ||
      selectedCategory !== null ||
      !defaultRange ||
      availabilityFilter !== 'all' ||
      (prescriptionFeaturesEnabled && prescriptionFilter !== 'all') ||
      onlyPromotions ||
      sortOption !== 'relevance'
    );
  }, [
    availabilityFilter,
    localSearch,
    onlyPromotions,
    priceBounds.max,
    priceBounds.min,
    priceRange,
    prescriptionFilter,
    prescriptionFeaturesEnabled,
    searchTerm,
    selectedCategory,
    sortOption,
  ]);

  const selectedCategoryEntity = selectedCategory
    ? categories.find((category) => category.id === selectedCategory)
    : undefined;
  const selectedCategoryLabel = selectedCategoryEntity
    ? getCategoryDisplayName(selectedCategoryEntity, language)
    : t('products.unknown');

  const effectiveSearchTerm = searchTerm.trim() ? searchTerm : localSearch.trim();

  const resultsTitle = effectiveSearchTerm
    ? `${t('products.resultsFor')} "${effectiveSearchTerm}"`
    : selectedCategory
    ? `${t('products.category')}: ${selectedCategoryLabel}`
    : t('products.allProducts');

  const handleResetFilters = () => {
    setLocalSearch('');
    setAvailabilityFilter('all');
    setPrescriptionFilter('all');
    setOnlyPromotions(false);
    setSortOption('relevance');
    setPriceRange([priceBounds.min, priceBounds.max]);
    if (selectedCategory !== null) {
      onCategoryChange(null);
    }
  };

  const handlePriceChange = (index: 0 | 1, value: number) => {
    if (Number.isNaN(value)) {
      return;
    }

    const clamped = Math.min(Math.max(value, priceBounds.min), priceBounds.max);

    setPriceRange((current) => {
      const next: [number, number] = [...current];
      next[index] = clamped;
      return [Math.min(next[0], next[1]), Math.max(next[0], next[1])];
    });
  };

  return (
    <div className="bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr] xl:gap-10">
          <aside className="flex flex-col gap-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-base font-semibold text-gray-900">{t('products.filtersTitle')}</h1>
                  <p className="text-xs text-gray-500">{t('products.filtersSubtitle')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-gray-500 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t('products.clearFilters')}
              </button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <label htmlFor="catalog-search" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('products.searchInCatalog')}
              </label>
              <div className="mt-2 relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="catalog-search"
                  type="search"
                  value={localSearch}
                  onChange={(event) => setLocalSearch(event.target.value)}
                  placeholder={t('products.searchPlaceholder')}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('products.category')}</p>
                {selectedCategory !== null && (
                  <button
                    type="button"
                    onClick={() => onCategoryChange(null)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-emerald-50 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-emerald-700 transition hover:border-emerald-200 hover:bg-white"
                  >
                    {t('products.viewAll')}
                  </button>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {categorySummaries.map((category) => {
                  const IconComponent = getCategoryIcon(category.icon);
                  const isSelected = selectedCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      title={category.translatedName}
                      onClick={() => onCategoryChange(isSelected ? null : category.id)}
                      className={`group inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-left text-[0.7rem] font-semibold transition ${
                        isSelected
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-emerald-200 hover:bg-white hover:text-emerald-700'
                      }`}
                    >
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-emerald-600 ${
                        isSelected ? 'bg-emerald-100' : 'bg-white'
                      }`}>
                        <IconComponent className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate">{category.translatedName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('products.priceRange')}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="price-min" className="text-[0.65rem] font-semibold uppercase tracking-wide text-gray-500">
                    {t('products.minPrice')}
                  </label>
                  <input
                    id="price-min"
                    type="number"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    value={priceRange[0]}
                    onChange={(event) => handlePriceChange(0, Number(event.target.value))}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="price-max" className="text-[0.65rem] font-semibold uppercase tracking-wide text-gray-500">
                    {t('products.maxPrice')}
                  </label>
                  <input
                    id="price-max"
                    type="number"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    value={priceRange[1]}
                    onChange={(event) => handlePriceChange(1, Number(event.target.value))}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('products.availability')}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { key: 'all' as AvailabilityFilter, label: t('products.availabilityAll') },
                    { key: 'inStock' as AvailabilityFilter, label: t('products.availabilityInStock') },
                    { key: 'outOfStock' as AvailabilityFilter, label: t('products.availabilityOutOfStock') },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setAvailabilityFilter(option.key)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        availabilityFilter === option.key
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {prescriptionFeaturesEnabled && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('products.prescriptionFilter')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { key: 'all' as PrescriptionFilter, label: t('products.availabilityAll') },
                      { key: 'requires' as PrescriptionFilter, label: t('products.requiresPrescription') },
                      { key: 'otc' as PrescriptionFilter, label: t('products.overTheCounter') },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setPrescriptionFilter(option.key)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          prescriptionFilter === option.key
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setOnlyPromotions((value) => !value)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  onlyPromotions
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-emerald-200 hover:bg-white hover:text-emerald-700'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {t('products.promotionsOnly')}
                </span>
                <span>{onlyPromotions ? '✓' : ''}</span>
              </button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('products.sortBy')}</p>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {[
                  { key: 'relevance' as SortOption, label: t('products.sortPopular') },
                  { key: 'priceAsc' as SortOption, label: t('products.sortPriceLowHigh') },
                  { key: 'priceDesc' as SortOption, label: t('products.sortPriceHighLow') },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSortOption(option.key)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      sortOption === option.key
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-emerald-200 hover:bg-white hover:text-emerald-700'
                    }`}
                  >
                    <span>{option.label}</span>
                    {sortOption === option.key && <span className="text-xs font-semibold text-emerald-600">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1.5">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    {t('products.catalogTitle')}
                  </p>
                  <h2 className="text-xl font-semibold text-gray-900 lg:text-2xl">{resultsTitle}</h2>
                  <p className="text-xs text-gray-600">
                    {`${visibleProducts.length} ${t('products.products')}`}
                  </p>
                </div>

                {selectedCategoryEntity && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-600">
                    {(() => {
                      const IconComponent = getCategoryIcon(selectedCategoryEntity.icon);
                      return (
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-600">
                          <IconComponent className="h-4 w-4" />
                        </span>
                      );
                    })()}
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-gray-900">{selectedCategoryLabel}</p>
                      <p className="text-[0.65rem] text-gray-500">
                        {t('products.inCategory')} {selectedCategoryLabel}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3.5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-gray-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {t('products.clearFilters')}
                </button>
              )}
            </div>

            <ProductGrid
              products={visibleProducts}
              isLoading={false}
              onEmptyAction={() => {
                handleResetFilters();
                onCategoryChange(null);
              }}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
