import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Category, Product, ProductPromotion } from '../types';
import { categories as initialCategories, products as initialProducts } from '../data/mockData';

interface ProductInput {
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  categoryId: number;
  requiresPrescription: boolean;
  activeIngredient?: string;
  activeIngredientEn?: string;
  dosage?: string;
  dosageEn?: string;
  manufacturer?: string;
  manufacturerEn?: string;
  promotion?: ProductPromotion | null;
}

interface ProductUpdates extends Partial<ProductInput> {}

interface ProductCatalogContextValue {
  products: Product[];
  categories: Category[];
  createProduct: (input: ProductInput) => Product;
  updateProduct: (id: number, updates: ProductUpdates) => Product | null;
  deleteProduct: (id: number) => void;
  upsertPromotion: (id: number, promotion: ProductPromotion) => Product | null;
  removePromotion: (id: number) => Product | null;
}

const STORAGE_KEY = 'aipharm.catalog.products';

const ProductCatalogContext = createContext<ProductCatalogContextValue | undefined>(undefined);

const sanitizePromotion = (promotion?: ProductPromotion | null): ProductPromotion | undefined => {
  if (!promotion) {
    return undefined;
  }

  const trimmedId = promotion.id.trim();
  const normalized: ProductPromotion = {
    ...promotion,
    id: trimmedId || `promo-${Date.now()}`,
    title: promotion.title.trim(),
    titleEn: promotion.titleEn.trim(),
    description: promotion.description.trim(),
    descriptionEn: promotion.descriptionEn.trim(),
    promoPrice: Number(promotion.promoPrice),
    discountPercentage:
      promotion.discountPercentage !== undefined && promotion.discountPercentage !== null
        ? Number(promotion.discountPercentage)
        : undefined,
    validUntil: promotion.validUntil?.trim() || undefined,
    badgeColor: promotion.badgeColor,
  };

  return normalized;
};

const buildProduct = (id: number, input: ProductInput): Product => ({
  id,
  name: input.name.trim(),
  nameEn: input.nameEn.trim() || input.name.trim(),
  description: input.description?.trim() || undefined,
  descriptionEn: input.descriptionEn?.trim() || input.description?.trim(),
  price: input.price,
  stockQuantity: input.stockQuantity,
  imageUrl: input.imageUrl.trim(),
  categoryId: input.categoryId,
  requiresPrescription: input.requiresPrescription,
  activeIngredient: input.activeIngredient?.trim() || undefined,
  activeIngredientEn: input.activeIngredientEn?.trim() || input.activeIngredient?.trim(),
  dosage: input.dosage?.trim() || undefined,
  dosageEn: input.dosageEn?.trim() || input.dosage?.trim(),
  manufacturer: input.manufacturer?.trim() || undefined,
  manufacturerEn: input.manufacturerEn?.trim() || input.manufacturer?.trim(),
  promotion: sanitizePromotion(input.promotion),
});

const persistProducts = (items: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to persist product catalog', error);
  }
};

const loadPersistedProducts = (): Product[] => {
  if (typeof window === 'undefined') {
    return initialProducts;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialProducts;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return initialProducts;
    }

    return parsed.map((item) => ({
      ...item,
      promotion: sanitizePromotion(item.promotion),
    })) as Product[];
  } catch (error) {
    console.warn('Failed to load persisted product catalog', error);
    return initialProducts;
  }
};

export const ProductCatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => loadPersistedProducts());

  useEffect(() => {
    persistProducts(products);
  }, [products]);

  const categories = useMemo(() => initialCategories, []);

  const createProduct = useCallback(
    (input: ProductInput): Product => {
      const nextId = products.length ? Math.max(...products.map((item) => item.id)) + 1 : 1;
      const newProduct = buildProduct(nextId, input);
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    },
    [products],
  );

  const updateProduct = useCallback(
    (id: number, updates: ProductUpdates): Product | null => {
      let updatedProduct: Product | null = null;
      setProducts((prev) =>
        prev.map((item) => {
          if (item.id !== id) {
            return item;
          }

          const merged: ProductInput = {
            name: updates.name ?? item.name,
            nameEn: updates.nameEn ?? item.nameEn,
            description: updates.description ?? item.description,
            descriptionEn: updates.descriptionEn ?? item.descriptionEn,
            price: updates.price ?? item.price,
            stockQuantity: updates.stockQuantity ?? item.stockQuantity,
            imageUrl: updates.imageUrl ?? item.imageUrl,
            categoryId: updates.categoryId ?? item.categoryId,
            requiresPrescription: updates.requiresPrescription ?? item.requiresPrescription,
            activeIngredient: updates.activeIngredient ?? item.activeIngredient,
            activeIngredientEn: updates.activeIngredientEn ?? item.activeIngredientEn,
            dosage: updates.dosage ?? item.dosage,
            dosageEn: updates.dosageEn ?? item.dosageEn,
            manufacturer: updates.manufacturer ?? item.manufacturer,
            manufacturerEn: updates.manufacturerEn ?? item.manufacturerEn,
            promotion:
              updates.promotion !== undefined
                ? updates.promotion
                : item.promotion
                ? { ...item.promotion }
                : null,
          };

          updatedProduct = buildProduct(id, merged);
          return updatedProduct;
        }),
      );

      return updatedProduct;
    },
    [],
  );

  const deleteProduct = useCallback((id: number) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const upsertPromotion = useCallback(
    (id: number, promotion: ProductPromotion) =>
      updateProduct(id, {
        promotion,
      }),
    [updateProduct],
  );

  const removePromotion = useCallback(
    (id: number) =>
      updateProduct(id, {
        promotion: null,
      }),
    [updateProduct],
  );

  const value = useMemo(
    () => ({ products, categories, createProduct, updateProduct, deleteProduct, upsertPromotion, removePromotion }),
    [products, categories, createProduct, updateProduct, deleteProduct, upsertPromotion, removePromotion],
  );

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
};

export const useProductCatalog = () => {
  const context = useContext(ProductCatalogContext);
  if (!context) {
    throw new Error('useProductCatalog must be used within a ProductCatalogProvider');
  }
  return context;
};
