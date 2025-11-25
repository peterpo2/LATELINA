import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      {language === 'bg' ? (
        // Show English option when current language is Bulgarian
        <button
          onClick={() => setLanguage('en')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md"
          title="Switch to English"
        >
          <div className="w-6 h-4 rounded-sm overflow-hidden shadow-sm">
            <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
              <rect width="60" height="30" fill="#012169" />
              <path
                d="M0 0L60 30M60 0L0 30"
                stroke="#ffffff"
                strokeWidth="6"
              />
              <path
                d="M0 0L60 30M60 0L0 30"
                stroke="#C8102E"
                strokeWidth="2.4"
              />
              <path
                d="M30 0v30M0 15h60"
                stroke="#ffffff"
                strokeWidth="10"
              />
              <path
                d="M30 0v30M0 15h60"
                stroke="#C8102E"
                strokeWidth="6"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-700">EN</span>
        </button>
      ) : (
        // Show Bulgarian option when current language is English
        <button
          onClick={() => setLanguage('bg')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md"
          title="Превключи на български"
        >
          <div className="w-6 h-4 rounded-sm overflow-hidden shadow-sm">
            <div className="w-full h-full bg-gradient-to-b from-white via-green-500 to-red-500">
              <div className="w-full h-1/3 bg-white"></div>
              <div className="w-full h-1/3 bg-green-500"></div>
              <div className="w-full h-1/3 bg-red-500"></div>
            </div>
          </div>
          <span className="text-sm font-semibold text-gray-700">БГ</span>
        </button>
      )}
    </div>
  );
};

export default LanguageSwitcher;