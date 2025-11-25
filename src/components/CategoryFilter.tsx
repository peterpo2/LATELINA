import React from "react";
import { Heart, Grid3X3 } from "lucide-react";

import { Category } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { getCategoryDisplayName, getCategoryIcon } from "../utils/categories";

interface CategoryFilterProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  categories: Category[];
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  categories,
}) => {
  const { t, language } = useLanguage();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Grid3X3 className="w-6 h-6 mr-3 text-emerald-600" />
          {t("categories.title")}
        </h3>
        <div className="text-sm text-gray-500">
          {categories.length + 1} {t("categories.title").toLowerCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* All Categories Button */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`group relative p-4 rounded-xl border-2 transition-all duration-300 text-center hover:scale-105 ${
            selectedCategory === null
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md"
              : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 bg-white"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-300 ${
              selectedCategory === null
                ? "bg-emerald-500 shadow-lg"
                : "bg-gray-100 group-hover:bg-emerald-100"
            }`}
          >
            <Heart
              className={`w-6 h-6 transition-all duration-300 ${
                selectedCategory === null
                  ? "text-white"
                  : "text-gray-500 group-hover:text-emerald-600"
              }`}
            />
          </div>
          <span className="text-sm font-semibold">{t("categories.all")}</span>
        </button>

        {/* Category Buttons */}
        {categories.map((category) => {
          const IconComponent = getCategoryIcon(category.icon);
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 text-center hover:scale-105 ${
                selectedCategory === category.id
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md"
                  : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 bg-white"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-emerald-500 shadow-lg"
                    : "bg-gray-100 group-hover:bg-emerald-100"
                }`}
              >
                <IconComponent
                  className={`w-6 h-6 transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "text-white"
                      : "text-gray-500 group-hover:text-emerald-600"
                  }`}
                />
              </div>
              <span className="text-sm font-semibold leading-tight">
                {getCategoryDisplayName(category, language)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
