import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { api } from '../../services/api';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  magicToken: string | null;
  verificationLoading: boolean;
  verificationError: string | null;
  loginLoading: boolean;
  loginError: string | null;
  profileLoading: boolean;
  profileError: string | null;
  passwordLoading: boolean;
  passwordError: string | null;
  accessRequests: { storeId: string; status: 'pending' | 'approved'; requestedAt: string }[];
  sessionExpiresAt: number | null;
}

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  magicToken: null,
  verificationLoading: false,
  verificationError: null,
  loginLoading: false,
  loginError: null,
  profileLoading: false,
  profileError: null,
  passwordLoading: false,
  passwordError: null,
  accessRequests: [],
  sessionExpiresAt: null,
};

export const loginWithCredentials = createAsyncThunk(
  'auth/loginWithCredentials',
  async (credentials: { usernameOrEmail: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.login(credentials.usernameOrEmail, credentials.password);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.logout();
    } catch (error) {
      // Ignore logout errors
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getMe();
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user');
    }
  }
);

export const updateUserProfileApi = createAsyncThunk(
  'auth/updateUserProfileApi',
  async (data: { fullName?: string; email?: string; mobileNumber?: string; avatarUrl?: string }, { rejectWithValue }) => {
    try {
      const response = await api.updateProfile(data);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const changeUserPasswordApi = createAsyncThunk(
  'auth/changeUserPasswordApi',
  async (data: { currentPassword?: string; newPassword: string }, { rejectWithValue }) => {
    try {
      await api.changePassword(data.currentPassword || '', data.newPassword);
      return { message: 'Password changed successfully' };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setMagicToken: (state, action: PayloadAction<string>) => {
      state.magicToken = action.payload;
    },
    clearLoginError: (state) => {
      state.loginError = null;
    },
    clearProfileError: (state) => {
      state.profileError = null;
    },
    clearPasswordError: (state) => {
      state.passwordError = null;
    },
    addUserAddress: (state, action: PayloadAction<import('../../types').UserAddress>) => {
      if (state.currentUser) {
        const addresses = state.currentUser.savedAddresses ? [...state.currentUser.savedAddresses] : [];
        const newAddress = {
          ...action.payload,
        };
        if (newAddress.isDefault || addresses.length === 0) {
          addresses.forEach((a) => (a.isDefault = false));
          newAddress.isDefault = true;
          state.currentUser.address = newAddress;
        }
        addresses.push(newAddress);
        state.currentUser.savedAddresses = addresses;
        if (!state.currentUser.address) {
          state.currentUser.address = newAddress;
        }
      }
    },
    updateUserAddress: (state, action: PayloadAction<import('../../types').UserAddress>) => {
      if (state.currentUser && state.currentUser.savedAddresses) {
        state.currentUser.savedAddresses = state.currentUser.savedAddresses.map((a) => {
          if (a.id === action.payload.id) {
            return action.payload;
          }
          if (action.payload.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        });
        if (action.payload.isDefault || state.currentUser.address?.id === action.payload.id) {
          state.currentUser.address = action.payload;
        }
      }
    },
    deleteUserAddress: (state, action: PayloadAction<string>) => {
      if (state.currentUser && state.currentUser.savedAddresses) {
        state.currentUser.savedAddresses = state.currentUser.savedAddresses.filter((a) => a.id !== action.payload);
        if (state.currentUser.address?.id === action.payload) {
          state.currentUser.address = state.currentUser.savedAddresses[0] || undefined;
          if (state.currentUser.address) {
            state.currentUser.address.isDefault = true;
          }
        }
      }
    },
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      if (state.currentUser && state.currentUser.savedAddresses) {
        state.currentUser.savedAddresses.forEach((a) => {
          a.isDefault = a.id === action.payload;
          if (a.id === action.payload) {
            state.currentUser!.address = a;
          }
        });
      }
    },
    requestStoreAccess: (state, action: PayloadAction<string>) => {
      const storeId = action.payload;
      if (!state.accessRequests.some((r) => r.storeId === storeId)) {
        state.accessRequests.push({
          storeId,
          status: 'pending',
          requestedAt: new Date().toISOString()
        });
      }
    },
    grantStoreAccessDirectly: (state, action: PayloadAction<string>) => {
      const storeId = action.payload;
      if (state.currentUser && !state.currentUser.accessibleStores.includes(storeId)) {
        state.currentUser.accessibleStores.push(storeId);
        state.accessRequests = state.accessRequests.filter((r) => r.storeId !== storeId);
      }
    },
    redeemInviteCode: (state, action: PayloadAction<{ inviteCode: string; storeId: string }>) => {
      const { storeId } = action.payload;
      if (state.currentUser && !state.currentUser.accessibleStores.includes(storeId)) {
        state.currentUser.accessibleStores.push(storeId);
      }
    },
    recordOrderSpend: (state, action: PayloadAction<{ amount: number }>) => {
      if (state.currentUser) {
        const current = state.currentUser.totalSpent || 0;
        state.currentUser.totalSpent = Math.round((current + action.payload.amount) * 100) / 100;
      }
    },
    subscribeToVipBlack: (
      state,
      action: PayloadAction<{ plan: 'monthly' | 'annual' }>
    ) => {
      if (state.currentUser) {
        state.currentUser.isVipBlackSubscribed = true;
        state.currentUser.vipBlackSubscriptionPlan = action.payload.plan;
        state.currentUser.vipBlackSubscribedAt = new Date().toISOString();
        const durationDays = action.payload.plan === 'annual' ? 365 : 30;
        state.currentUser.vipBlackExpiresAt = new Date(Date.now() + durationDays * 86400000).toISOString();
      }
    },
    cancelVipBlackSubscription: (state) => {
      if (state.currentUser) {
        state.currentUser.isVipBlackSubscribed = false;
        state.currentUser.vipBlackSubscriptionPlan = undefined;
        state.currentUser.vipBlackExpiresAt = undefined;
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.magicToken = null;
      state.verificationError = null;
      state.loginError = null;
      state.profileError = null;
      state.passwordError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithCredentials.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
        state.verificationError = null;
      })
      .addCase(loginWithCredentials.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.loginError = null;
        state.verificationError = null;
        state.sessionExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      })
      .addCase(loginWithCredentials.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.magicToken = null;
        state.verificationError = null;
        state.loginError = null;
        state.sessionExpiresAt = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.sessionExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.sessionExpiresAt = null;
      })
      .addCase(updateUserProfileApi.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updateUserProfileApi.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.currentUser = action.payload;
        state.profileError = null;
      })
      .addCase(updateUserProfileApi.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })
      .addCase(changeUserPasswordApi.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = null;
      })
      .addCase(changeUserPasswordApi.fulfilled, (state) => {
        state.passwordLoading = false;
        state.passwordError = null;
        if (state.currentUser) {
          state.currentUser.isTemporaryPassword = false;
          state.currentUser.hasCompletedPasswordSetup = true;
          state.currentUser.passwordChangedAt = new Date().toISOString();
        }
      })
      .addCase(changeUserPasswordApi.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError = action.payload as string;
      });
  }
});

export const {
  setMagicToken,
  clearLoginError,
  clearProfileError,
  clearPasswordError,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  requestStoreAccess,
  grantStoreAccessDirectly,
  redeemInviteCode,
  recordOrderSpend,
  subscribeToVipBlack,
  cancelVipBlackSubscription,
  logout
} = authSlice.actions;

export default authSlice.reducer;
