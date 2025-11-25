import React, { createContext, useContext, useMemo, useReducer, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean };

const initialState: CartState = {
  items: [],
  isOpen: false,
  total: 0,
  itemCount: 0,
};

interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const calculateTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { total, itemCount };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find((item) => item.product.id === action.payload.id);
      let newItems: CartItem[];

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        const newItem: CartItem = {
          id: Date.now(),
          product: action.payload,
          quantity: 1,
          unitPrice: action.payload.promotion?.promoPrice ?? action.payload.price,
        };
        newItems = [...state.items, newItem];
      }

      const { total, itemCount } = calculateTotals(newItems);

      return { ...state, items: newItems, total, itemCount };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      const { total, itemCount } = calculateTotals(newItems);

      return { ...state, items: newItems, total, itemCount };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0);

      const { total, itemCount } = calculateTotals(newItems);

      return { ...state, items: newItems, total, itemCount };
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0, itemCount: 0 };
    
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    
    case 'SET_CART_OPEN':
      return { ...state, isOpen: action.payload };
    
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const value = useMemo<CartContextValue>(() => ({ state, dispatch }), [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};