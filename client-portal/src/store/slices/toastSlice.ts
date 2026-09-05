import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  _timeout?: boolean;
}

interface ToastState {
  toasts: ToastMessage[];
}

const initialState: ToastState = {
  toasts: [],
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<{ type: ToastMessage['type']; message: string }>) => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 9);
      state.toasts.push({ id, ...action.payload });
      if (state.toasts.length > 5) {
        state.toasts.shift();
      }
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
