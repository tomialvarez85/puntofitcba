"use client";

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";

export type CartItemType = "product" | "combo";

export type CartItem = {
  type: CartItemType;
  id: string;
  name: string;
  slug: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
  stock?: number | null;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { type: CartItemType; id: string } }
  | { type: "UPDATE_QUANTITY"; payload: { type: CartItemType; id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

function clampQuantity(quantity: number, stock?: number | null) {
  const safeQuantity = Math.max(1, Math.floor(quantity) || 1);

  if (typeof stock === "number" && stock > 0) {
    return Math.min(safeQuantity, stock);
  }

  return safeQuantity;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((item) => item.type === action.payload.type && item.id === action.payload.id);

      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item === existing
              ? { ...item, quantity: clampQuantity(item.quantity + action.payload.quantity, item.stock) }
              : item,
          ),
          isOpen: true,
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload, quantity: clampQuantity(action.payload.quantity, action.payload.stock) },
        ],
        isOpen: true,
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => !(item.type === action.payload.type && item.id === action.payload.id)),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.type === action.payload.type && item.id === action.payload.id
            ? { ...item, quantity: clampQuantity(action.payload.quantity, item.stock) }
            : item,
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "OPEN_CART":
      return { ...state, isOpen: true };

    case "CLOSE_CART":
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (type: CartItemType, id: string) => void;
  updateQuantity: (type: CartItemType, id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  const addItem = useCallback((item: CartItem) => dispatch({ type: "ADD_ITEM", payload: item }), []);

  const removeItem = useCallback(
    (type: CartItemType, id: string) => dispatch({ type: "REMOVE_ITEM", payload: { type, id } }),
    [],
  );

  const updateQuantity = useCallback(
    (type: CartItemType, id: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", payload: { type, id, quantity } }),
    [],
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const openCart = useCallback(() => dispatch({ type: "OPEN_CART" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE_CART" }), []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      isOpen: state.isOpen,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
    }),
    [state.items, state.isOpen, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider.");
  }

  return context;
}
