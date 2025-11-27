import React from 'react';
const LanguageSwitcher: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
      <div className="w-6 h-4 rounded-sm overflow-hidden shadow-sm">
        <div className="w-full h-full bg-gradient-to-b from-white via-green-500 to-red-500">
          <div className="w-full h-1/3 bg-white"></div>
          <div className="w-full h-1/3 bg-green-500"></div>
          <div className="w-full h-1/3 bg-red-500"></div>
        </div>
      </div>
      <span className="text-sm font-semibold text-gray-700">БГ</span>
    </div>
  );
};

export default LanguageSwitcher;