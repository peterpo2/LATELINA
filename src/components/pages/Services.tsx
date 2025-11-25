import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Stethoscope,
  Truck,
  CheckCircle,
  Shield,
  HeartPulse,
  Headset
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Services: React.FC = () => {
  const { t } = useLanguage();

  const services = [
    {
      id: 1,
      icon: Bot,
      iconBg: 'bg-emerald-100 text-emerald-600',
      title: t('services.aiConsultationsTitle'),
      description: t('services.aiConsultationsDescription'),
      features: [
        t('services.aiConsultationsFeature1'),
        t('services.aiConsultationsFeature2'),
        t('services.aiConsultationsFeature3')
      ]
    },
    {
      id: 2,
      icon: Stethoscope,
      iconBg: 'bg-blue-100 text-blue-600',
      title: t('services.telepharmacyTitle'),
      description: t('services.telepharmacyDescription'),
      features: [
        t('services.telepharmacyFeature1'),
        t('services.telepharmacyFeature2'),
        t('services.telepharmacyFeature3')
      ]
    },
    {
      id: 3,
      icon: Truck,
      iconBg: 'bg-amber-100 text-amber-600',
      title: t('services.deliveryTitle'),
      description: t('services.deliveryDescription'),
      features: [
        t('services.deliveryFeature1'),
        t('services.deliveryFeature2'),
        t('services.deliveryFeature3')
      ]
    }
  ];

  const values = [
    {
      id: 1,
      icon: HeartPulse,
      title: t('services.valuePatients'),
      description: t('services.valuePatientsDesc')
    },
    {
      id: 2,
      icon: Shield,
      title: t('services.valueData'),
      description: t('services.valueDataDesc')
    },
    {
      id: 3,
      icon: Headset,
      title: t('services.valueSupport'),
      description: t('services.valueSupportDesc')
    }
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 space-y-12">
        <section className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('services.pageTitle')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('services.pageDescription')}
          </p>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          {services.map((service) => {
            const IconComponent = service.icon;

            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${service.iconBg}`}>
                  <IconComponent className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{service.title}</h2>
                <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
                <ul className="space-y-3 mt-auto">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-1" />
                      <span className="text-gray-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('services.valueTitle')}</h2>
            <p className="text-gray-600 max-w-3xl">{t('services.valueSubtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => {
              const IconComponent = value.icon;

              return (
                <div key={value.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <IconComponent className="w-8 h-8 text-emerald-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-3xl p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-3xl font-bold mb-3">{t('services.ctaTitle')}</h3>
            <p className="text-white/80 max-w-2xl">{t('services.ctaDescription')}</p>
          </div>
          <Link
            to="/contacts"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            {t('services.ctaButton')}
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Services;
