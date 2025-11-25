import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface LogoProps {
  className?: string;
}

const AIPharmLogo: React.FC<LogoProps> = ({ className = 'h-10' }) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center space-x-3">
      <div
        className={`flex aspect-square items-center justify-center rounded-2xl bg-emerald-50 p-2 shadow-inner ${className}`}
      >
        <img
          src="/pharmacy-icon.svg"
          alt={t('header.title')}
          className="h-full w-full object-contain text-emerald-600"
        />
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

export default AIPharmLogo;