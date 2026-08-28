import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '../../types';
import { api } from '../../services/api';

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isOrderModalOpen: boolean;
  isProcessingCheckout: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  activeOrder: null,
  isOrderModalOpen: false,
  isProcessingCheckout: false,
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getOrders();
      return response.orders;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response = await api.createOrder(orderData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create order');
    }
  }
);

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    startCheckoutProcessing: (state) => {
      state.isProcessingCheckout = true;
    },
    checkoutSuccess: (state, action: PayloadAction<Order>) => {
      state.isProcessingCheckout = false;
      state.orders.unshift(action.payload);
      state.activeOrder = action.payload;
      state.isOrderModalOpen = true;
    },
    checkoutFailure: (state) => {
      state.isProcessingCheckout = false;
    },
    setActiveOrder: (state, action: PayloadAction<Order | null>) => {
      state.activeOrder = action.payload;
    },
    toggleOrderModal: (state, action: PayloadAction<boolean | undefined>) => {
      state.isOrderModalOpen = action.payload !== undefined ? action.payload : !state.isOrderModalOpen;
    },
    advanceOrderStatus: (state, action: PayloadAction<{ orderId: string; newStatus: Order['status'] }>) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.newStatus;
        if (state.activeOrder && state.activeOrder.id === action.payload.orderId) {
          state.activeOrder.status = action.payload.newStatus;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isProcessingCheckout = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isProcessingCheckout = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  startCheckoutProcessing,
  checkoutSuccess,
  checkoutFailure,
  setActiveOrder,
  toggleOrderModal,
  advanceOrderStatus
} = orderSlice.actions;

export default orderSlice.reducer;
