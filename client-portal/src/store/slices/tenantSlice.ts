import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Store, Product } from '../../types';
import { api } from '../../services/api';

interface TenantState {
  stores: Store[];
  products: Product[];
  activeStoreId: string | null;
  selectedCategory: string;
  searchQuery: string;
  minPriceFilter: number;
  maxPriceFilter: number;
  selectedProductId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  stores: [],
  products: [],
  activeStoreId: null,
  selectedCategory: 'ALL',
  searchQuery: '',
  minPriceFilter: 0,
  maxPriceFilter: 50000,
  selectedProductId: null,
  loading: false,
  error: null,
};

export const fetchStores = createAsyncThunk(
  'tenant/fetchStores',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getStores();
      return response.stores;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch stores');
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'tenant/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getProducts();
      return response.products;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
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
