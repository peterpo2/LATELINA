import { Category } from '../types';

type Gradient = [string, string];

type ImageOptions = {
  width: number;
  height: number;
  gradient: Gradient;
  icon?: string;
  accent?: string;
  fontSize?: number;
  subtitleSize?: number;
  iconSize?: number;
};

const escapeSvgText = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const truncate = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
};

const createSvgDataUri = (
  title: string,
  subtitle: string,
  {
    width,
    height,
    gradient,
    icon,
    accent = '#ffffff0d',
    fontSize = 32,
    subtitleSize = 18,
    iconSize = 52,
  }: ImageOptions
): string => {
  const safeTitle = escapeSvgText(title);
  const safeSubtitle = escapeSvgText(subtitle);
  const gradientId = `grad-${Math.random().toString(36).slice(2, 8)}`;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${safeTitle} illustration">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradient[0]}" />
      <stop offset="100%" stop-color="${gradient[1]}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#${gradientId})" rx="32" />
  <g opacity="0.3">
    <circle cx="${width * 0.75}" cy="${height * 0.25}" r="${Math.min(width, height) * 0.45}" fill="${accent}" />
    <circle cx="${width * 0.2}" cy="${height * 0.8}" r="${Math.min(width, height) * 0.35}" fill="${accent}" />
  </g>
  ${
    icon
      ? `<text x="40" y="${height / 3}" font-size="${iconSize}" fill="rgba(255,255,255,0.95)" font-family="'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif">${escapeSvgText(
          icon
        )}</text>`
      : ''
  }
  <text x="40" y="${height / 2 + fontSize / 2}" font-size="${fontSize}" fill="rgba(255,255,255,0.95)" font-family="'Poppins', 'Segoe UI', Arial, sans-serif" font-weight="600">
    ${safeTitle}
  </text>
  <text x="40" y="${height / 2 + fontSize / 2 + subtitleSize + 20}" font-size="${subtitleSize}" fill="rgba(255,255,255,0.82)" font-family="'Poppins', 'Segoe UI', Arial, sans-serif">
    ${safeSubtitle}
  </text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const productCategoryMap: Record<
  number,
  { subtitle: string; gradient: Gradient; icon: string }
> = {
  1: {
    subtitle: 'Pain Relief Essentials',
    gradient: ['#0f766e', '#14b8a6'],
    icon: '💊',
  },
  2: {
    subtitle: 'Daily Vitamins & Wellness',
    gradient: ['#7c3aed', '#a855f7'],
    icon: '🌿',
  },
  3: {
    subtitle: 'Cold & Flu Care',
    gradient: ['#2563eb', '#38bdf8'],
    icon: '🤧',
  },
  4: {
    subtitle: 'Digestive Support',
    gradient: ['#f97316', '#fbbf24'],
    icon: '🫗',
  },
  5: {
    subtitle: 'Skin & Hair Care',
    gradient: ['#be123c', '#f43f5e'],
    icon: '✨',
  },
  6: {
    subtitle: 'Kids Health',
    gradient: ['#2563eb', '#a855f7'],
    icon: '🧸',
  },
};

const newsCategoryPalette: Record<string, Gradient> = {
  'health tips': ['#0f172a', '#2563eb'],
  'vitamins & supplements': ['#166534', '#22c55e'],
  skincare: ['#9d174d', '#f472b6'],
  technology: ['#1f2937', '#0ea5e9'],
  "children's health": ['#0369a1', '#38bdf8'],
  'digestive health': ['#92400e', '#f97316'],
};

const defaultNewsGradient: Gradient = ['#312e81', '#6366f1'];

export const generateProductImage = (title: string, categoryId: number): string => {
  const config = productCategoryMap[categoryId] ?? {
    subtitle: 'Pharmacy Essentials',
    gradient: ['#0369a1', '#38bdf8'] as Gradient,
    icon: '🩺',
  };

  const truncatedTitle = truncate(title, 28);
  return createSvgDataUri(truncatedTitle, config.subtitle, {
    width: 400,
    height: 400,
    gradient: config.gradient,
    icon: config.icon,
    accent: '#ffffff12',
    fontSize: 30,
    subtitleSize: 18,
    iconSize: 56,
  });
};

export const generateNewsImage = (title: string, category: string): string => {
  const key = category.trim().toLowerCase();
  const gradient = newsCategoryPalette[key] ?? defaultNewsGradient;
  const truncated = truncate(title, 34);
  return createSvgDataUri(truncated, category, {
    width: 800,
    height: 500,
    gradient,
    icon: '📰',
    accent: '#ffffff0e',
    fontSize: 44,
    subtitleSize: 22,
    iconSize: 64,
  });
};

export const attachCategoryArtwork = (category: Category, accent: Gradient): string => {
  return createSvgDataUri(category.name, category.description ?? '', {
    width: 400,
    height: 260,
    gradient: accent,
    icon: '🏥',
    accent: '#ffffff10',
    fontSize: 26,
    subtitleSize: 16,
    iconSize: 48,
  });
};
