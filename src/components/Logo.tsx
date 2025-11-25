import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface LogoProps {
  className?: string;
}

const LatelinaLogo: React.FC<LogoProps> = ({ className = 'h-10' }) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center space-x-3">
      <div
        className={`flex aspect-square items-center justify-center rounded-2xl bg-emerald-50 p-2 shadow-inner ${className}`}
      >
        <svg
          role="img"
          aria-label={t('header.title')}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-full w-full"
        >
          <path d="M12 2 2 7l10 5 10-5-10-5z" />
          <path d="m2 17 10 5 10-5" />
          <path d="m2 12 10 5 10-5" />
          <path d="M8 12v4" />
          <path d="M16 12v4" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="text-xl font-bold text-emerald-700">{t('header.title')}</p>
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-500">
          {t('header.subtitle')}
        </p>
      </div>
    </div>
  );
};

export default LatelinaLogo;