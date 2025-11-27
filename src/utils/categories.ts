import type { LucideIcon } from 'lucide-react';
import { Gift, Heart, Sparkles, Star, Moon, Crown } from 'lucide-react';

import type { Category } from '../types';
import type { Language } from '../context/LanguageContext';

const categoryIconMap: Record<string, LucideIcon> = {
  heart: Heart,
  gift: Gift,
  sparkles: Sparkles,
  star: Star,
  moon: Moon,
  crown: Crown,
};

const categoryNameTranslations: Record<string, string> = {
  'Мечета от рози': 'Rose bears',
  'Подаръчни кошници': 'Gift baskets',
  'Романтични комплекти': 'Romantic sets',
  'Сладки изненади': 'Sweet treats',
  'Декорации': 'Decor',
  'Специални поводи': 'Special moments',
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
