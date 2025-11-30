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

export const getCategoryIcon = (iconKey: string): LucideIcon => {
  return categoryIconMap[iconKey] || Heart;
};

export const getCategoryDisplayName = (category: Category, _language: Language): string => {
  return category.name;
};
