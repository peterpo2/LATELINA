import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { useLanguage } from '../context/LanguageContext';
import ProductDetailModal from './ProductDetailModal';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onEmptyAction?: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading = false, onEmptyAction }) => {
  const { t } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-12">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="bg-gray-200 aspect-[4/3]" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="bg-emerald-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <Package className="w-12 h-12 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t('products.noProducts')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('products.tryDifferent')}
        </p>
        {onEmptyAction && (
          <button
            type="button"
            onClick={onEmptyAction}
            className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-emerald-700"
          >
            {t('products.viewAll')}
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onProductClick={setSelectedProduct} />
        ))}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default ProductGrid;