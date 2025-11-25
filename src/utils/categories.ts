import type { LucideIcon } from 'lucide-react';
import { Pill, Heart, Thermometer, Car, Droplet, Baby } from 'lucide-react';

import type { Category } from '../types';
import type { Language } from '../context/LanguageContext';

const categoryIconMap: Record<string, LucideIcon> = {
  pill: Pill,
  heart: Heart,
  thermometer: Thermometer,
  stomach: Car,
  droplet: Droplet,
  baby: Baby,
};

const categoryNameTranslations: Record<string, string> = {
  'Обезболяващи': 'Painkillers',
  Витамини: 'Vitamins',
  'Простуда и грип': 'Cold & Flu',
  'Стомашно-чревни': 'Digestive',
  'Кожа и коса': 'Skin & Hair',
  'Детски продукти': 'Children',
};

export const getCategoryIcon = (iconKey: string): LucideIcon => {
  return categoryIconMap[iconKey] || Heart;
};

export const getCategoryDisplayName = (category: Category, language: Language): string => {
  if (language === 'en') {
    return categoryNameTranslations[category.name] || category.name;
  }

  return category.name;
};
