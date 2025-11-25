import React, { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  RefreshCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

interface TwoFactorState {
  twoFactorToken: string;
  destinationEmail?: string;
  codeExpiresAt?: string;
  emailSent?: boolean;
  message?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { login, verifyTwoFactor, resendTwoFactor } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [twoFactor, setTwoFactor] = useState<TwoFactorState | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', password: '', rememberMe: false });
      setShowPassword(false);
      setIsLoading(false);
      setIsResending(false);
      setError('');
      setInfo('');
      setTwoFactor(null);
      setTwoFactorCode('');
      setCooldown(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldown(prev => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const formatExpiry = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString();
  };

  const resetTwoFactor = () => {
    setTwoFactor(null);
    setTwoFactorCode('');
    setCooldown(0);
  };

  const handleClose = () => {
    setFormData({ email: '', password: '', rememberMe: false });
    setShowPassword(false);
    setIsLoading(false);
    setIsResending(false);
    setError('');
    setInfo('');
    resetTwoFactor();
    onClose();
  };

  const handleSwitchToRegisterInternal = () => {
    setError('');
    setInfo('');
    resetTwoFactor();
    setFormData({ email: '', password: '', rememberMe: false });
    setShowPassword(false);
    onSwitchToRegister();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');

    const result = await login(
      formData.email,
      formData.password,
      formData.rememberMe
    );

    setIsLoading(false);

    if (result.success) {
      handleClose();
      return;
    }

    if (result.requiresTwoFactor && result.twoFactor) {
      setTwoFactor({
        twoFactorToken: result.twoFactor.twoFactorToken,
        destinationEmail: result.twoFactor.destinationEmail,
        codeExpiresAt: result.twoFactor.codeExpiresAt,
        emailSent: result.twoFactor.emailSent,
        message: result.message || t('auth.twoFactorSubtitle'),
      });
      setTwoFactorCode('');
      setCooldown(result.twoFactor.cooldownSeconds ?? 0);
      setInfo(result.message || t('auth.twoFactorSubtitle'));
      return;
    }

    setError(result.message || t('auth.loginError'));
  };

  const handleVerifyTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactor) return;

    setIsLoading(true);
    setError('');
    setInfo('');

    const result = await verifyTwoFactor(
      formData.email,
      twoFactor.twoFactorToken,
      twoFactorCode.trim(),
      formData.rememberMe
    );

    setIsLoading(false);

    if (result.success) {
      handleClose();
      return;
    }

    setError(result.message || t('auth.twoFactorInvalid'));

    if (result.twoFactor) {
      setTwoFactor({
        twoFactorToken: result.twoFactor.twoFactorToken,
        destinationEmail:
          result.twoFactor.destinationEmail ?? twoFactor.destinationEmail,
        codeExpiresAt:
          result.twoFactor.codeExpiresAt ?? twoFactor.codeExpiresAt,
        emailSent:
          typeof result.twoFactor.emailSent === 'boolean'
            ? result.twoFactor.emailSent
            : twoFactor.emailSent,
        message: result.message || twoFactor.message,
      });
      if (result.twoFactor.cooldownSeconds !== undefined) {
        setCooldown(result.twoFactor.cooldownSeconds);
      }
    }
  };

  const handleResendCode = async () => {
    if (!twoFactor || cooldown > 0) {
      return;
    }

    setIsResending(true);
    setError('');
    setInfo('');

    const result = await resendTwoFactor(
      formData.email,
      twoFactor.twoFactorToken
    );

    setIsResending(false);

    if (!result.success || !result.twoFactor) {
      setError(result.message || t('auth.twoFactorResendError'));
      return;
    }

    setTwoFactor({
      twoFactorToken: result.twoFactor.twoFactorToken,
      destinationEmail:
        result.twoFactor.destinationEmail ?? twoFactor.destinationEmail,
      codeExpiresAt:
        result.twoFactor.codeExpiresAt ?? twoFactor.codeExpiresAt,
      emailSent:
        typeof result.twoFactor.emailSent === 'boolean'
          ? result.twoFactor.emailSent
          : twoFactor.emailSent,
      message: result.message || twoFactor.message,
    });
    setTwoFactorCode('');
    setCooldown(result.twoFactor.cooldownSeconds ?? 0);
    setInfo(result.message || t('auth.twoFactorResent'));
  };

  const handleTwoFactorBack = () => {
    setError('');
    setInfo('');
    resetTwoFactor();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const isTwoFactorStep = Boolean(twoFactor);
  const formattedExpiry = formatExpiry(twoFactor?.codeExpiresAt);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-in">
          <div className="relative bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6 rounded-t-3xl">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-xl">
                {isTwoFactorStep ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <LogIn className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">
                  {isTwoFactorStep ? t('auth.twoFactorTitle') : t('auth.login')}
                </h2>
                <p className="text-white/90">
                  {isTwoFactorStep
                    ? t('auth.twoFactorSubtitle')
                    : t('auth.loginSubtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {info && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
                {info}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {isTwoFactorStep ? (
              <>
                <form onSubmit={handleVerifyTwoFactor} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.twoFactorCodeLabel')}
                    </label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={twoFactorCode}
                        onChange={e =>
                          setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 tracking-widest uppercase"
                        placeholder={t('auth.twoFactorCodePlaceholder')}
                        maxLength={8}
                        required
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    {twoFactor?.destinationEmail && (
                      <p>
                        {t('auth.twoFactorSentTo')}{' '}
                        <span className="font-medium text-gray-800">
                          {twoFactor.destinationEmail}
                        </span>
                      </p>
                    )}
                    {formattedExpiry && (
                      <p>
                        {t('auth.twoFactorExpiresAt')}{' '}
                        <span className="font-medium text-gray-800">
                          {formattedExpiry}
                        </span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || twoFactorCode.trim().length === 0}
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {isLoading
                      ? t('auth.twoFactorChecking')
                      : t('auth.twoFactorSubmit')}
                  </button>
                </form>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleTwoFactorBack}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {t('auth.twoFactorBack')}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending || cooldown > 0}
                    className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span>
                      {isResending
                        ? t('auth.twoFactorResending')
                        : cooldown > 0
                        ? `${t('auth.twoFactorResend')} (${cooldown}s)`
                        : t('auth.twoFactorResend')}
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                        placeholder="example@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">{t('auth.rememberMe')}</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    {t('auth.noAccount')}{' '}
                    <button
                      onClick={handleSwitchToRegisterInternal}
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      {t('auth.registerHere')}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;