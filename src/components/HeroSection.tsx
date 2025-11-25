import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useChat } from "../context/ChatContext";

const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const { setIsOpen } = useChat();

  const handleOpenAssistant = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            {/* Main Title */}
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              {t("hero.certifiedQuality")}
            </div>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-xl mx-auto">
              {t("hero.description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center">
              <Link
                to="/products"
                className="group bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span>{t("hero.viewProducts")}</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <button
                onClick={handleOpenAssistant}
                className="group border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                {t("hero.aiAssistant")}
              </button>
            </div>

            {/* Stats - Only 3 key stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200 max-w-xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  10,000+
                </div>
                <div className="text-sm text-gray-600">
                  {t("hero.satisfiedClients")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  5,000+
                </div>
                <div className="text-sm text-gray-600">
                  {t("hero.productsInStock")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  24/7
                </div>
                <div className="text-sm text-gray-600">
                  {t("hero.professionalCare")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1440 120" className="w-full h-20 fill-white">
          <path d="M0,96L48,80C96,64,192,32,288,37.3C384,43,480,85,576,90.7C672,96,768,64,864,53.3C960,43,1056,53,1152,64C1248,75,1344,85,1392,90.7L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
