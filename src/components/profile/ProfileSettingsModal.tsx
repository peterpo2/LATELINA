import React, { useEffect, useMemo, useState } from 'react';
import { X, Mail, User, Phone, MapPin, Shield, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MessageState = { type: 'success' | 'error'; text: string } | null;

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, isAdmin, isStaff } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
  });
  const [message, setMessage] = useState<MessageState>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!user) {
      setFormData({ fullName: '', phoneNumber: '', address: '' });
      setMessage(null);
      return;
    }

    setFormData({
      fullName: user.fullName ?? '',
      phoneNumber: user.phoneNumber ?? '',
      address: user.address ?? '',
    });
    setMessage(null);
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      (formData.fullName ?? '') !== (user.fullName ?? '') ||
      (formData.phoneNumber ?? '') !== (user.phoneNumber ?? '') ||
      (formData.address ?? '') !== (user.address ?? '')
    );
  }, [formData, user]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onClose();
  };

  const handleFormClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || isSaving) return;

    setIsSaving(true);
    setMessage(null);

    const payload = {
      fullName: formData.fullName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      address: formData.address.trim(),
    };

    const result = await updateProfile(payload);

    if (result.success) {
      setMessage({ type: 'success', text: result.message || t('profile.success') });
    } else {
      setMessage({ type: 'error', text: result.message || t('profile.error') });
    }

    setIsSaving(false);
  };

  const resetChanges = () => {
    if (!user) return;
    setFormData({
      fullName: user.fullName ?? '',
      phoneNumber: user.phoneNumber ?? '',
      address: user.address ?? '',
    });
    setMessage(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" onClick={handleBackdropClick} />

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10" onClick={handleBackdropClick}>
        <div
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
          onClick={handleFormClick}
        >
          <div className="relative bg-gradient-to-r from-blue-600 to-emerald-500 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-2xl">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-semibold">{t('profile.title')}</h2>
                <p className="text-white/90">{t('profile.subtitle')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {user ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.email')}</p>
                    <p className="font-medium text-gray-900 flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{user.email}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{t('profile.readonlyEmail')}</p>
                  </div>
                  {isAdmin ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1">
                      <Shield className="h-3.5 w-3.5 mr-1" />
                      {t('profile.adminBadge')}
                    </span>
                  ) : (
                    isStaff && (
                      <span className="inline-flex items-center rounded-full bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1">
                        <Settings className="h-3.5 w-3.5 mr-1" />
                        {t('profile.staffBadge')}
                      </span>
                    )
                  )}
                </div>

                {message && (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="fullName">
                      {t('profile.fullName')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        maxLength={150}
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder={t('profile.fullNamePlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phoneNumber">
                      {t('profile.phoneNumber')}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        maxLength={30}
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder={t('profile.phonePlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="address">
                      {t('profile.address')}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        maxLength={250}
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder={t('profile.addressPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={resetChanges}
                      disabled={!hasChanges || isSaving}
                      className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('profile.reset')}
                    </button>
                    <button
                      type="submit"
                      disabled={!hasChanges || isSaving}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSaving ? t('profile.saving') : t('profile.save')}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center text-gray-500">
                {t('profile.notAuthenticated')}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSettingsModal;
