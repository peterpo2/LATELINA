import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, CreditCard, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from './CheckoutModal';
import type { Product } from '../types';

const CartDrawer: React.FC = () => {
  const { state, dispatch } = useCart();
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const getProductName = (product: Product) =>
    language === 'bg' ? product.name : product.nameEn;
  const getActiveIngredient = (product: Product) =>
    language === 'bg' ? product.activeIngredient : product.activeIngredientEn;
  const getDosage = (product: Product) =>
    language === 'bg' ? product.dosage : product.dosageEn;
  const getManufacturer = (product: Product) =>
    language === 'bg' ? product.manufacturer : product.manufacturerEn;

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const freeDeliveryThreshold = 25;
  const freeDeliveryMessage =
    state.total >= freeDeliveryThreshold
      ? t('cart.freeDelivery')
      : t('cart.addForFreeDelivery').replace(
          '{amount}',
          Math.max(0, freeDeliveryThreshold - state.total).toFixed(2),
        );

  const handleCheckout = () => {
    if (!isAuthenticated || state.items.length === 0) {
      return;
    }
    setShowCheckoutModal(true);
    dispatch({ type: 'SET_CART_OPEN', payload: false });
  };

  const handleOrderCreated = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const handleCloseCheckout = () => {
    setShowCheckoutModal(false);
  };

  const handleLoginPromptClick = () => {
    dispatch({ type: 'SET_CART_OPEN', payload: false });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aiPharm:openLoginModal'));
    }
  };

  if (!state.isOpen && !showCheckoutModal) return null;

  return (
    <>
      {state.isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => dispatch({ type: 'SET_CART_OPEN', payload: false })}
          />

          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-6 w-6 text-primary-600" />
                <h2 className="font-display text-xl font-semibold text-gray-900">
                  {t('cart.title')} ({state.itemCount})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_CART_OPEN', payload: false })}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {state.items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-display mb-2 text-lg font-semibold text-gray-900">
                    {t('cart.empty')}
                  </h3>
                  <p className="mb-6 text-gray-600">
                    {t('cart.emptyDescription')}
                  </p>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_CART_OPEN', payload: false })}
                    className="rounded-xl bg-primary-500 px-6 py-3 font-medium text-white transition-all duration-200 hover:bg-primary-600"
                  >
                    {t('cart.continueShopping')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  {state.items.map((item) => (
                    <div key={item.id} className="rounded-xl bg-gray-50 p-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={item.product.imageUrl}
                          alt={getProductName(item.product)}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-display mb-1 font-medium text-gray-900">
                            {getProductName(item.product)}
                          </h4>
                          {getActiveIngredient(item.product) && (
                            <p className="mb-2 text-sm text-gray-600">
                              {getActiveIngredient(item.product)}
                            </p>
                          )}
                          {getDosage(item.product) && (
                            <p className="mb-2 text-sm text-gray-600">
                              {getDosage(item.product)}
                            </p>
                          )}
                          {getManufacturer(item.product) && (
                            <p className="mb-2 text-sm text-gray-600">
                              {getManufacturer(item.product)}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:border-primary-500 hover:text-primary-600"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="min-w-[2rem] text-center font-medium text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:border-primary-500 hover:text-primary-600"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="font-semibold text-gray-900">
                                €{(item.unitPrice * item.quantity).toFixed(2)}
                              </p>
                              {item.product.promotion && (
                                <div className="text-xs text-gray-500">
                                  <p className="line-through">
                                    {t('cart.regularPrice')}: €{item.product.price.toFixed(2)}
                                  </p>
                                  <p className="font-semibold text-emerald-600">
                                    {t('cart.promoPrice')}: €{item.unitPrice.toFixed(2)}
                                  </p>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-sm text-red-600 transition-colors hover:text-red-700"
                              >
                                {t('cart.remove')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {state.items.length > 0 && (
              <div className="space-y-4 border-t border-gray-200 p-6">
                <div className="font-display flex items-center justify-between text-lg font-semibold">
                  <span>{t('cart.total')}:</span>
                  <span className="text-primary-600">€{state.total.toFixed(2)}</span>
                </div>

                <div className="rounded-lg bg-green-50 p-3 text-sm text-gray-600">
                  <span className="text-green-700">{freeDeliveryMessage}</span>
                </div>

                {!isAuthenticated && (
                  <div className="flex items-center space-x-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <Lock className="h-4 w-4" />
                    <button
                      type="button"
                      onClick={handleLoginPromptClick}
                      className="font-semibold underline-offset-4 transition-colors hover:underline focus:underline focus:outline-none"
                    >
                      {t('cart.loginRequired')}
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={!isAuthenticated}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-primary-500 px-6 py-4 font-medium text-white transition-all duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>{t('cart.checkout')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_CART_OPEN', payload: false })}
                    className="w-full rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    {t('cart.continueShopping')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <CheckoutModal
        isOpen={showCheckoutModal}
        items={state.items}
        total={state.total}
        onClose={handleCloseCheckout}
        onOrderCreated={handleOrderCreated}
      />
    </>
  );
};

export default CartDrawer;