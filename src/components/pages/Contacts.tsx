import React from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Contacts: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('footer.contacts')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contacts.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contacts.info')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('contacts.phone')}</h3>
                    <p className="text-gray-600">+359 2 123 4567</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('contacts.email')}</h3>
                    <p className="text-gray-600">aipharmproject@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-red-100 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('contacts.address')}</h3>
                    <p className="text-gray-600">ул. Витошка 1, София 1000</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('footer.workingHours')}</h3>
                    <p className="text-gray-600 whitespace-pre-line">{t('footer.workingHoursText')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MessageCircle className="w-6 h-6 text-red-600" />
                <h3 className="font-bold text-red-900">{t('contacts.emergency')}</h3>
              </div>
              <p className="text-red-700 mb-4">{t('contacts.emergencyText')}</p>
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg inline-block font-bold">
                {t('contacts.emergencyNumber')}: 112
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contacts.sendMessage')}</h2>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contacts.firstName')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t('contacts.firstNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contacts.lastName')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t('contacts.lastNamePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contacts.email')}
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('contacts.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contacts.subject')}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('contacts.subjectPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contacts.message')}
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('contacts.messagePlaceholder')}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                {t('contacts.send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;