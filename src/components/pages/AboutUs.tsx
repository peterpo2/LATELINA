import React from "react";
import { Shield, Users, Clock, Heart, Stethoscope } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const AboutUs: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("footer.aboutUs")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("about.description")}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-primary-100 p-3 rounded-xl mr-4">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t("about.mission")}
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {t("about.missionText")}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-secondary-100 p-3 rounded-xl mr-4">
                <Stethoscope className="w-8 h-8 text-secondary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t("about.vision")}
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {t("about.visionText")}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t("about.quality")}
            </h3>
            <p className="text-gray-600">{t("about.qualityText")}</p>
          </div>

          <div className="text-center">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t("about.speed")}
            </h3>
            <p className="text-gray-600">{t("about.speedText")}</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t("about.care")}
            </h3>
            <p className="text-gray-600">{t("about.careText")}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">10,000+</div>
              <div className="text-primary-100">{t("about.clients")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">5,000+</div>
              <div className="text-primary-100">{t("about.products")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">15+</div>
              <div className="text-primary-100">{t("about.experience")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-primary-100">{t("about.support")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
