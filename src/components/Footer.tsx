import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Stethoscope, Shield, Award, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import AIPharmLogo from './Logo';
import { quickLinks } from '../data/navigation';
import { APP_VERSION } from '../config/appVersion';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [rating, setRating] = React.useState(0);
  const [message, setMessage] = React.useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!rating || !message.trim()) {
      return;
    }

    const subject = encodeURIComponent(t('footer.feedbackEmailSubject'));
    const body = encodeURIComponent(
      `${t('footer.ratingLabel')}: ${rating}/5\n\n${message.trim()}`,
    );

    window.location.href = `mailto:aipharmproject@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-secondary-900/20" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-gentle" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-gentle" />
      
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <AIPharmLogo className="h-16" />
            </div>
            
            <p className="text-gray-300 mb-8 max-w-lg leading-relaxed text-lg">
              {t('footer.description')}
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <Shield className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-xs text-gray-300 font-medium">{t('hero.certifiedQuality')}</p>
              </div>
              <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <Stethoscope className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-xs text-gray-300 font-medium">{t('hero.support247')}</p>
              </div>
              <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <Award className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-xs text-gray-300 font-medium">{t('hero.qualityAwards')}</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl">
                <Instagram className="w-5 h-5" />
              </button>
              <button className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-xl mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <div className="w-1 h-1 bg-primary-400 rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-300"></div>
                    <span>{t(link.key)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-bold text-xl mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('footer.contactsTitle')}
            </h4>
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-300">{t('header.phone')}</span>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-300">info@onlineaptekasoftware.bg</span>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-300">ул. Витошка 1, София</span>
              </div>
            </div>
            
            {/* Working hours */}
            <div className="mt-8 p-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 backdrop-blur-sm rounded-xl border border-primary-500/20">
              <h5 className="font-semibold text-white mb-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{t('footer.workingHours')}</span>
              </h5>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {t('footer.workingHoursText')}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="mt-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="lg:w-1/2 space-y-3">
                <h3 className="font-display text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  {t('footer.feedbackTitle')}
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {t('footer.feedbackDescription')}
                </p>
              </div>

              <form className="lg:w-1/2 space-y-6" onSubmit={handleSubmit}>
                <div>
                  <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                    {t('footer.ratingLabel')}
                  </span>
                  <div className="mt-2 flex items-center space-x-3">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const value = index + 1;
                      const isActive = value <= rating;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className={`p-3 rounded-xl border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60 ${
                            isActive
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 border-amber-300 shadow-lg shadow-amber-500/30'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                          aria-label={`${value} ${t('footer.starsLabel')}`}
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isActive ? 'text-white fill-white' : 'text-amber-200/60'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="feedback-message" className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                    {t('footer.messageLabel')}
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={t('footer.messagePlaceholder')}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder:text-gray-400 focus:border-primary-400/60 focus:outline-none focus:ring-2 focus:ring-primary-400/40 min-h-[140px] resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-gray-400">
                    {t('footer.feedbackPrivacy')}
                  </p>
                  <button
                    type="submit"
                    disabled={!rating || !message.trim()}
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:from-primary-600 hover:to-secondary-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t('footer.submitButton')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-center sm:text-left">
            <p className="text-gray-400 text-sm">
              {t('footer.version', { version: APP_VERSION })}
            </p>
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-end space-x-6 text-sm text-gray-400">
            <button className="hover:text-white transition-colors duration-300 hover:underline">
              {t('footer.privacy')}
            </button>
            <button className="hover:text-white transition-colors duration-300 hover:underline">
              {t('footer.terms')}
            </button>
            <button className="hover:text-white transition-colors duration-300 hover:underline">
              {t('footer.cookies')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;