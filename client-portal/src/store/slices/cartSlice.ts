import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, CartItem } from '../../types';

interface CartState {
  items: CartItem[];
  isCartDrawerOpen: boolean;
  appliedPromoCode: string | null;
  promoDiscountPercent: number;
  isCheckoutModalOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isCartDrawerOpen: false,
  appliedPromoCode: null,
  promoDiscountPercent: 0,
  isCheckoutModalOpen: false
};

// Helper: Calculate unit price and discount based on quantity and product priceTiers
export function calculateTierPricing(product: Product, quantity: number) {
  let appliedUnitPrice = product.basePrice;
  let appliedDiscountPercent = 0;

  // Sort tiers by minQuantity descending
  const sortedTiers = [...product.priceTiers].sort((a, b) => b.minQuantity - a.minQuantity);

  for (const tier of sortedTiers) {
    if (quantity >= tier.minQuantity) {
      appliedUnitPrice = tier.unitPrice;
      appliedDiscountPercent = tier.discountPercentage;
      break;
    }
  }

  const itemSubtotal = appliedUnitPrice * quantity;
  const itemTax = itemSubtotal * product.taxRate;

  return {
    appliedUnitPrice,
    appliedDiscountPercent,
    itemSubtotal,
    itemTax
  };
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCartDrawer: (state, action: PayloadAction<boolean | undefined>) => {
      state.isCartDrawerOpen = action.payload !== undefined ? action.payload : !state.isCartDrawerOpen;
    },
    toggleCheckoutModal: (state, action: PayloadAction<boolean | undefined>) => {
      state.isCheckoutModalOpen = action.payload !== undefined ? action.payload : !state.isCheckoutModalOpen;
    },
    addItemToCart: (
      state,
      action: PayloadAction<{ product: Product; quantity?: number }>
    ) => {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );

      const targetQuantity =
        existingItemIndex >= 0
          ? state.items[existingItemIndex].quantity + quantity
          : Math.max(quantity, product.moq || 1);

      const pricing = calculateTierPricing(product, targetQuantity);

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex] = {
          ...state.items[existingItemIndex],
          quantity: targetQuantity,
          ...pricing
        };
      } else {
        state.items.push({
          product,
          quantity: targetQuantity,
          storeId: product.storeId,
          storeName: product.storeName,
          ...pricing
        });
      }
    },
    updateItemQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      const index = state.items.findIndex((item) => item.product.id === productId);

      if (index >= 0) {
        if (quantity <= 0) {
          state.items.splice(index, 1);
        } else {
          const product = state.items[index].product;
          const adjustedQty = Math.max(quantity, product.moq || 1);
          const pricing = calculateTierPricing(product, adjustedQty);
          state.items[index] = {
            ...state.items[index],
            quantity: adjustedQty,
            ...pricing
          };
        }
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
    },
    applyPromoCode: (
      state,
      action: PayloadAction<{ code: string; discountPercent: number }>
    ) => {
      state.appliedPromoCode = action.payload.code;
      state.promoDiscountPercent = action.payload.discountPercent;
    },
    removePromoCode: (state) => {
      state.appliedPromoCode = null;
      state.promoDiscountPercent = 0;
    },
    clearCart: (state) => {
      state.items = [];
      state.appliedPromoCode = null;
      state.promoDiscountPercent = 0;
    }
  }
});

export const {
  toggleCartDrawer,
  toggleCheckoutModal,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  applyPromoCode,
  removePromoCode,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
