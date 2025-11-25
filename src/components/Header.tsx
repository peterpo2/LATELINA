import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Phone,
  LogOut,
  Settings,
  Shield,
  Receipt,
  ClipboardList,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';
import AIPharmLogo from './Logo';
import ProfileSettingsModal from './profile/ProfileSettingsModal';
import MyOrdersModal from './profile/MyOrdersModal';
import { quickLinks } from '../data/navigation';

interface HeaderProps {
  onSearch: (term: string) => void;
  searchTerm: string;
  onNavigateToCategories: () => void;
  onNavigateToProducts: () => void;
  onNavigateToPromotions: () => void;
  onNavigateToNews: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  searchTerm,
  onNavigateToCategories,
  onNavigateToProducts,
  onNavigateToPromotions,
  onNavigateToNews,
}) => {
  const { state, dispatch } = useCart();
  const { user, isAuthenticated, isAdmin, isStaff, logout } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());
  const userMenuRef = useRef<HTMLDivElement>(null);

  const canAccessAdmin = isAdmin || isStaff;
  const panelLabel = isAdmin ? t('header.adminPanel') : t('header.staffPanel');
  const PanelBadgeIcon = isAdmin ? Shield : ClipboardList;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleOpenLoginModal = () => setShowLoginModal(true);

    window.addEventListener('aiPharm:openLoginModal', handleOpenLoginModal);

    return () => {
      window.removeEventListener('aiPharm:openLoginModal', handleOpenLoginModal);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const locale = language === 'bg' ? 'bg-BG' : 'en-GB';

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'full',
      }).format(currentDateTime),
    [currentDateTime, locale]
  );

  const formattedTime = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        timeStyle: 'medium',
      }).format(currentDateTime),
    [currentDateTime, locale]
  );

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setShowProfileModal(false);
    setShowOrdersModal(false);
  };

  const openProfileModal = () => {
    setShowUserMenu(false);
    setShowProfileModal(true);
  };

  const openOrdersModal = () => {
    setShowUserMenu(false);
    setShowOrdersModal(true);
  };

  useEffect(() => {
    if (!showUserMenu) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [showUserMenu]);

  const navigationItems = [
    {
      key: 'navigation.categories',
      path: '/categories',
      onClick: onNavigateToCategories,
    },
    {
      key: 'navigation.products',
      path: '/products',
      onClick: onNavigateToProducts,
    },
    {
      key: 'navigation.promotions',
      path: '/promotions',
      onClick: onNavigateToPromotions,
    },
    {
      key: 'navigation.news',
      path: '/news',
      onClick: onNavigateToNews,
    },
  ];

  const handleNavigationClick = (callback: () => void) => {
    callback();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm text-gray-600 border-b border-gray-50">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">{t('header.phone')}</span>
            </div>
            <span className="text-emerald-600 font-medium">{t('header.freeDelivery')}</span>
          </div>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            <div className="flex items-center space-x-2 text-emerald-700 font-medium">
              <span>{formattedDate}</span>
              <span className="text-gray-300">•</span>
              <span>{formattedTime}</span>
            </div>
            {isAuthenticated && canAccessAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center space-x-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100"
              >
                <PanelBadgeIcon className="h-4 w-4" />
                <span>{panelLabel}</span>
              </Link>
            )}
            {isAuthenticated && (
              <button
                onClick={openOrdersModal}
                className="inline-flex items-center space-x-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-100"
              >
                <Receipt className="h-4 w-4" />
                <span>{t('header.myOrders')}</span>
              </button>
            )}
            {isAuthenticated ? (
              <span className="text-emerald-600 font-medium">
                {t('header.hello')}, {user?.fullName || user?.email}
                {canAccessAdmin && (
                  <PanelBadgeIcon className={`inline w-4 h-4 ml-1 ${
                    isAdmin ? 'text-amber-500' : 'text-sky-500'
                  }`} />
                )}
              </span>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="hover:text-emerald-600 transition-colors font-medium"
              >
                {t('header.myProfile')}
              </button>
            )}
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <AIPharmLogo className="h-12" />
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('header.search')}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative p-3 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-all duration-200 group"
            >
              <ShoppingCart className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform duration-200" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {state.itemCount}
                </span>
              )}
            </button>

            {/* User */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => isAuthenticated ? setShowUserMenu(!showUserMenu) : setShowLoginModal(true)}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isAuthenticated 
                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-600' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <User className="w-6 h-6" />
                {canAccessAdmin && (
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                    isAdmin ? 'bg-amber-500' : 'bg-sky-500'
                  }`}>
                    {isAdmin ? (
                      <Shield className="w-2.5 h-2.5 text-white" />
                    ) : (
                      <Settings className="w-2.5 h-2.5 text-white" />
                    )}
                  </div>
                )}
              </button>

              {/* User Dropdown */}
              {showUserMenu && isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user?.fullName || 'Потребител'}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    {canAccessAdmin && (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          isAdmin
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {isAdmin ? (
                          <Shield className="w-3 h-3 mr-1" />
                        ) : (
                          <Settings className="w-3 h-3 mr-1" />
                        )}
                        {t(isAdmin ? 'header.administrator' : 'header.staffMember')}
                      </span>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={openProfileModal}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>{t('header.settings')}</span>
                    </button>
                    <button
                      onClick={openOrdersModal}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>{t('header.myOrders')}</span>
                    </button>
                    {canAccessAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className={`w-full px-4 py-2 text-left flex items-center space-x-2 ${
                          isAdmin
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-sky-600 hover:bg-sky-50'
                        }`}
                      >
                        <PanelBadgeIcon className="w-4 h-4" />
                        <span>{panelLabel}</span>
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('header.logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button
              className="md:hidden p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-2 border-t border-gray-100 py-3 text-sm font-medium text-gray-600">
          {navigationItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavigationClick(item.onClick)}
                className={`relative rounded-full px-4 py-2 transition-colors duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {t(item.key)}
              </button>
            );
          })}
        </nav>

        {/* Mobile search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('header.search')}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all duration-200"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-3">
          {navigationItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavigationClick(item.onClick)}
                className={`block w-full text-left py-2 text-base font-semibold transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
                }`}
              >
                {t(item.key)}
              </button>
            );
          })}
          {quickLinks.map((link) => (
            <Link
              key={link.key}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`block w-full text-left py-2 transition-colors ${
                location.pathname === link.path
                  ? 'text-emerald-600 font-semibold'
                  : 'text-gray-700 hover:text-emerald-600'
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowOrdersModal(true);
                }}
                className="flex w-full items-center space-x-2 rounded-xl border border-gray-100 px-4 py-2 text-left text-gray-700 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                <Receipt className="h-4 w-4" />
                <span>{t('header.myOrders')}</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openProfileModal();
                }}
                className="flex w-full items-center space-x-2 rounded-xl border border-gray-100 px-4 py-2 text-left text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
              >
                <Settings className="h-4 w-4" />
                <span>{t('header.settings')}</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  void handleLogout();
                }}
                className="flex w-full items-center space-x-2 rounded-xl border border-gray-100 px-4 py-2 text-left text-red-600 transition hover:border-red-200 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('header.logout')}</span>
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <button
                onClick={() => setShowLoginModal(true)}
                className="block w-full text-left py-2 text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
              >
                {t('header.login')}
              </button>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="block w-full text-left py-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                {t('header.register')}
              </button>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
      <ProfileSettingsModal isOpen={showProfileModal && isAuthenticated} onClose={() => setShowProfileModal(false)} />
      <MyOrdersModal isOpen={showOrdersModal && isAuthenticated} onClose={() => setShowOrdersModal(false)} />
    </header>
  );
};

export default Header;