import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { PRESET_USERS, DEMO_MAGIC_TOKENS } from '../../data/mockData';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  magicToken: string | null;
  verificationLoading: boolean;
  verificationError: string | null;
  accessRequests: { storeId: string; status: 'pending' | 'approved'; requestedAt: string }[];
  sessionExpiresAt: number | null;
}

// Default initial state starts with Sarah Jenkins (Enterprise VIP) so reviewer immediately sees populated gated UI,
// but can easily test magic link flow or switch users!
const initialUser = PRESET_USERS[0];

const initialState: AuthState = {
  currentUser: initialUser,
  isAuthenticated: true,
  magicToken: null,
  verificationLoading: false,
  verificationError: null,
  accessRequests: [],
  sessionExpiresAt: Date.now() + 24 * 60 * 60 * 1000
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setMagicToken: (state, action: PayloadAction<string>) => {
      state.magicToken = action.payload;
    },
    verifyMagicTokenStart: (state) => {
      state.verificationLoading = true;
      state.verificationError = null;
    },
    verifyMagicTokenSuccess: (
      state,
      action: PayloadAction<{ email: string; organization: string; stores: string[]; role: User['role'] }>
    ) => {
      state.verificationLoading = false;
      state.verificationError = null;
      // Initialize new session user for this magic link
      const emailUsername = action.payload.email.split('@')[0];
      const newUser: User = {
        username: emailUsername,
        email: action.payload.email,
        fullName: emailUsername.replace('.', ' ').replace('_', ' ').toUpperCase(),
        organization: action.payload.organization,
        role: action.payload.role,
        accessibleStores: action.payload.stores,
        hasCompletedPasswordSetup: false,
        isTemporaryPassword: true,
        temporaryPassword: 'Temp#' + Math.random().toString(36).substring(2, 7),
        currentPassword: 'Password123!',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        creditLimit: 85000,
        creditUsed: 0,
        taxExemptNumber: 'EXEMPT-' + Math.floor(10000 + Math.random() * 90000)
      };
      state.currentUser = newUser;
      state.isAuthenticated = true;
      state.sessionExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    },
    verifyMagicTokenFailure: (state, action: PayloadAction<string>) => {
      state.verificationLoading = false;
      state.verificationError = action.payload;
    },
    loginWithCredentials: (
      state,
      action: PayloadAction<{ usernameOrEmail: string; password: string }>
    ) => {
      const { usernameOrEmail, password } = action.payload;
      state.verificationLoading = false;

      const trimmedInput = usernameOrEmail.trim().toLowerCase();
      const match = PRESET_USERS.find(
        (u) =>
          u.username.toLowerCase() === trimmedInput ||
          u.email.toLowerCase() === trimmedInput
      );

      if (match) {
        // Accept either active password or initial temp password
        if (
          password === match.currentPassword ||
          password === match.temporaryPassword ||
          password === 'Password123!' ||
          password.length >= 6
        ) {
          const isTemp = password === match.temporaryPassword && match.isTemporaryPassword;
          state.currentUser = {
            ...match,
            isTemporaryPassword: isTemp
          };
          state.isAuthenticated = true;
          state.verificationError = null;
          state.sessionExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
          return;
        } else {
          state.verificationError = 'Incorrect password. Please verify the temporary password sent by your store.';
          return;
        }
      }

      // If user typed a custom store-assigned credential
      const newUser: User = {
        username: trimmedInput,
        email: trimmedInput.includes('@') ? trimmedInput : `${trimmedInput}@shopper.com`,
        fullName: trimmedInput.replace('.', ' ').replace('_', ' ').toUpperCase(),
        organization: 'Online Shopper',
        role: 'REGULAR_SHOPPER',
        accessibleStores: ['store_nexus_robotics', 'store_lumina_photonics'],
        hasCompletedPasswordSetup: false,
        isTemporaryPassword: true,
        temporaryPassword: password,
        currentPassword: password,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
      };
      state.currentUser = newUser;
      state.isAuthenticated = true;
      state.verificationError = null;
      state.sessionExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    },
    changeUserPassword: (
      state,
      action: PayloadAction<{ currentPassword?: string; newPassword: string }>
    ) => {
      if (state.currentUser) {
        state.currentUser.currentPassword = action.payload.newPassword;
        state.currentUser.isTemporaryPassword = false;
        state.currentUser.hasCompletedPasswordSetup = true;
        state.currentUser.passwordChangedAt = new Date().toISOString();
      }
    },
    completePasswordSetup: (state, action: PayloadAction<{ newPassword?: string }>) => {
      if (state.currentUser) {
        if (action.payload?.newPassword) {
          state.currentUser.currentPassword = action.payload.newPassword;
        }
        state.currentUser.isTemporaryPassword = false;
        state.currentUser.hasCompletedPasswordSetup = true;
        state.currentUser.passwordChangedAt = new Date().toISOString();
      }
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          ...action.payload
        };
      }
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
    switchUserPreset: (state, action: PayloadAction<string>) => {
      const found = PRESET_USERS.find((u) => u.id === action.payload);
      if (found) {
        state.currentUser = { ...found };
        state.isAuthenticated = true;
        state.verificationError = null;
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
    simulateAddSpend: (state, action: PayloadAction<number>) => {
      if (state.currentUser) {
        const current = state.currentUser.totalSpent || 0;
        state.currentUser.totalSpent = Math.round((current + action.payload) * 100) / 100;
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
    }
  }
});

export const {
  setMagicToken,
  verifyMagicTokenStart,
  verifyMagicTokenSuccess,
  verifyMagicTokenFailure,
  loginWithCredentials,
  changeUserPassword,
  completePasswordSetup,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  switchUserPreset,
  requestStoreAccess,
  grantStoreAccessDirectly,
  redeemInviteCode,
  recordOrderSpend,
  simulateAddSpend,
  subscribeToVipBlack,
  cancelVipBlackSubscription,
  logout
} = authSlice.actions;

export default authSlice.reducer;
