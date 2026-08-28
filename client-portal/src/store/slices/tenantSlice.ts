import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Store, Product } from '../../types';
import { INITIAL_STORES, INITIAL_PRODUCTS } from '../../data/mockData';

interface TenantState {
  stores: Store[];
  products: Product[];
  activeStoreId: string | null;
  selectedCategory: string;
  searchQuery: string;
  minPriceFilter: number;
  maxPriceFilter: number;
  selectedProductId: string | null;
}

const initialState: TenantState = {
  stores: INITIAL_STORES,
  products: INITIAL_PRODUCTS,
  activeStoreId: null,
  selectedCategory: 'ALL',
  searchQuery: '',
  minPriceFilter: 0,
  maxPriceFilter: 50000,
  selectedProductId: null,
};

export const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setActiveStore: (state, action: PayloadAction<string | null>) => {
      state.activeStoreId = action.payload;
      state.selectedCategory = 'ALL';
      state.searchQuery = '';
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setPriceFilter: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.minPriceFilter = action.payload.min;
      state.maxPriceFilter = action.payload.max;
    },
    setSelectedProductId: (state, action: PayloadAction<string | null>) => {
      state.selectedProductId = action.payload;
    },
    resetFilters: (state) => {
      state.selectedCategory = 'ALL';
      state.searchQuery = '';
      state.minPriceFilter = 0;
      state.maxPriceFilter = 50000;
    }
  }
});

export const {
  setActiveStore,
  setSelectedCategory,
  setSearchQuery,
  setPriceFilter,
  setSelectedProductId,
  resetFilters
} = tenantSlice.actions;

export default tenantSlice.reducer;
