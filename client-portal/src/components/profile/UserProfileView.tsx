import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Home, 
  Briefcase, 
  Check, 
  Edit3, 
  Plus, 
  Trash2, 
  Star, 
  Save, 
  X, 
  ShoppingBag, 
  Package, 
  Store as StoreIcon, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Lock,
  Key,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  Crown,
  Award,
  Zap,
  TrendingUp,
  Percent,
  Flame
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { 
  updateUserProfile, 
  addUserAddress, 
  updateUserAddress, 
  deleteUserAddress, 
  setDefaultAddress,
  changeUserPassword,
  simulateAddSpend,
  cancelVipBlackSubscription 
} from '../../store/slices/authSlice';
import { getUserGatedTier, getTierProgress, GATED_TIERS } from '../../utils/tierUtils';
import { VipBlackModal } from '../auth/VipBlackModal';
import { setCurrentView, setActiveStore } from '../../store/slices/tenantSlice';
import { setActiveOrder, toggleOrderModal } from '../../store/slices/orderSlice';
import { UserAddress } from '../../types';
import confetti from 'canvas-confetti';

const AVATAR_PRESETS = [
  { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80', label: 'Sarah' },
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', label: 'Marcus' },
  { url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', label: 'Alex' },
  { url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', label: 'Elena' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', label: 'David' }
];

export const UserProfileView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { stores } = useAppSelector((state) => state.tenant);
  const { orders } = useAppSelector((state) => state.order);

  const [activeTab, setActiveTab] = useState<'profile' | 'tier' | 'security' | 'addresses' | 'orders'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // Gated Tier calculation
  const userGatedTier = getUserGatedTier(currentUser, orders);
  const tierConfig = GATED_TIERS[userGatedTier];
  const tierProgress = getTierProgress(currentUser, orders);

  // Shopper Form State
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.mobileNumber || currentUser?.phone || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatarUrl || AVATAR_PRESETS[0].url);

  // Password Change State
  const [currentOrTempPassword, setCurrentOrTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Address Modal State (for Adding or Editing an address)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [modalAddrLabel, setModalAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [modalAddrRecipient, setModalAddrRecipient] = useState('');
  const [modalAddrStreet, setModalAddrStreet] = useState('');
  const [modalAddrApartment, setModalAddrApartment] = useState('');
  const [modalAddrCity, setModalAddrCity] = useState('');
  const [modalAddrState, setModalAddrState] = useState('');
  const [modalAddrZip, setModalAddrZip] = useState('');
  const [modalAddrCountry, setModalAddrCountry] = useState('United States');
  const [modalAddrPhone, setModalAddrPhone] = useState('');
  const [modalAddrIsDefault, setModalAddrIsDefault] = useState(false);

  // Sync state whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setEmail(currentUser.email || '');
      setMobileNumber(currentUser.mobileNumber || currentUser.phone || '');
      setSelectedAvatar(currentUser.avatarUrl || AVATAR_PRESETS[0].url);
      setCurrentOrTempPassword(currentUser.temporaryPassword || currentUser.currentPassword || '');
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-[#e67e22] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          No Shopper Profile Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#9aa8b2] mb-6">
          Please select a shopper profile from the top bar to view and edit details.
        </p>
        <button
          onClick={() => dispatch(setCurrentView('dashboard'))}
          className="px-5 py-2.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          Go to Store Catalog
        </button>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    // Preserve primary address or initialize default if needed
    let updatedAddress = currentUser.address;
    if (updatedAddress) {
      updatedAddress = {
        ...updatedAddress,
        recipientName: fullName,
        phone: mobileNumber
      };
    }

    dispatch(
      updateUserProfile({
        fullName,
        email,
        mobileNumber,
        phone: mobileNumber,
        avatarUrl: selectedAvatar,
        address: updatedAddress
      })
    );

    setIsEditingProfile(false);
    setSaveSuccessMessage('Your profile information was updated successfully!');

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {}

    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 3500);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);

    setTimeout(() => {
      dispatch(
        changeUserPassword({
          currentPassword: currentOrTempPassword,
          newPassword
        })
      );

      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmNewPassword('');
      setSaveSuccessMessage('Password changed successfully! You can now use your new password anytime.');

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 4000);
    }, 600);
  };

  const handleOpenAddAddressModal = () => {
    setEditingAddressId(null);
    setModalAddrLabel('Home');
    setModalAddrRecipient(currentUser.fullName);
    setModalAddrStreet('');
    setModalAddrApartment('');
    setModalAddrCity('');
    setModalAddrState('');
    setModalAddrZip('');
    setModalAddrCountry('United States');
    setModalAddrPhone(currentUser.mobileNumber || currentUser.phone || '');
    setModalAddrIsDefault((currentUser.savedAddresses?.length || 0) === 0);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddressModal = (addr: UserAddress) => {
    setEditingAddressId(addr.id || null);
    setModalAddrLabel((addr.label as any) || 'Home');
    setModalAddrRecipient(addr.recipientName || currentUser.fullName);
    setModalAddrStreet(addr.street);
    setModalAddrApartment(addr.apartment || '');
    setModalAddrCity(addr.city);
    setModalAddrState(addr.state);
    setModalAddrZip(addr.zipCode);
    setModalAddrCountry(addr.country);
    setModalAddrPhone(addr.phone || currentUser.mobileNumber || '');
    setModalAddrIsDefault(!!addr.isDefault);
    setIsAddressModalOpen(true);
  };

  const handleSaveModalAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const addressData: UserAddress = {
      id: editingAddressId || `addr_${Date.now().toString(36)}`,
      label: modalAddrLabel,
      recipientName: modalAddrRecipient || currentUser.fullName,
      street: modalAddrStreet,
      apartment: modalAddrApartment,
      city: modalAddrCity,
      state: modalAddrState,
      zipCode: modalAddrZip,
      country: modalAddrCountry,
      phone: modalAddrPhone || currentUser.mobileNumber,
      isDefault: modalAddrIsDefault
    };

    if (editingAddressId) {
      dispatch(updateUserAddress(addressData));
    } else {
      dispatch(addUserAddress(addressData));
    }

    setIsAddressModalOpen(false);
    setSaveSuccessMessage(editingAddressId ? 'Shipping address updated!' : 'New delivery address added!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const userOrders = orders.filter(
    (o) => o.userId === currentUser.id || o.userEmail === currentUser.email
  );

  const grantedStores = stores.filter((s) => currentUser.accessibleStores?.includes(s.id));
  const savedAddressesList = currentUser.savedAddresses || (currentUser.address ? [currentUser.address] : []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {saveSuccessMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 cursor-pointer text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Temporary Password Active Banner (if user is still using store temp password) */}
      {currentUser.isTemporaryPassword && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-xs font-bold">
                  Store-Issued Temporary Password Active
                </p>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-md">
                  {currentUser.temporaryPassword || 'Temp#Active'}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                You logged in with the temporary password sent by your store. You can change it to your own custom password anytime.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('security')}
            className="px-3.5 py-1.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Change Password Now
          </button>
        </div>
      )}

      {/* Shopper Profile Header Card */}
      <div className="bg-white dark:bg-[#1a2530] rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        
        {/* Background Warm Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#e67e22]/15 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative group">
              <img
                src={currentUser.avatarUrl || AVATAR_PRESETS[0].url}
                alt={currentUser.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-[#e67e22]/30 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1a2530] flex items-center justify-center text-white text-[10px] shadow-sm">
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {currentUser.fullName}
                </h1>
                
                {/* Store Username Badge */}
                <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center space-x-1">
                  <UserIcon className="w-3 h-3 text-[#e67e22]" />
                  <span>@{currentUser.username || currentUser.email.split('@')[0]}</span>
                </span>

                {/* Password State Badge */}
                {currentUser.isTemporaryPassword ? (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center space-x-1">
                    <Key className="w-3 h-3 text-amber-500" />
                    <span>Temp Password</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Custom Password Set</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 dark:text-[#9aa8b2]">
                <span className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">{currentUser.email}</span>
                </span>

                {(currentUser.mobileNumber || currentUser.phone) && (
                  <span className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#e67e22]" />
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                      {currentUser.mobileNumber || currentUser.phone}
                    </span>
                  </span>
                )}

                {currentUser.address && (
                  <span className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {currentUser.address.city}, {currentUser.address.state}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => {
                setIsEditingProfile(!isEditingProfile);
                setActiveTab('profile');
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
            >
              {isEditingProfile ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Close Edit</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Quick Shopping Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9aa8b2] block">
              Assigned Gated Tier
            </span>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${tierConfig.badgeClass}`}>
                <span>{tierConfig.icon}</span>
                <span>{userGatedTier}</span>
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9aa8b2] block">
              Lifetime Store Spend
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-mono font-extrabold text-[#1a2530] dark:text-white">
                ${tierProgress.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9aa8b2] block">
              Orders Placed
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-[#1a2530] dark:text-white">
                {userOrders.length}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-[#9aa8b2]">Purchases</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9aa8b2] block">
              Username Handle
            </span>
            <div className="mt-1 flex items-center space-x-1 text-xs font-mono font-bold text-[#e67e22]">
              <span>@{currentUser.username || 'shopper'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#1a2530] text-white dark:bg-[#e67e22] dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Personal Information</span>
        </button>

        <button
          onClick={() => setActiveTab('tier')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'tier'
              ? 'bg-[#1a2530] text-white dark:bg-[#e67e22] dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-500" />
          <span>Gated Tier & VIP Membership</span>
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${tierConfig.badgeClass}`}>
            {userGatedTier}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#1a2530] text-white dark:bg-[#e67e22] dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Password</span>
          {currentUser.isTemporaryPassword && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'addresses'
              ? 'bg-[#1a2530] text-white dark:bg-[#e67e22] dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>My Delivery Addresses ({savedAddressesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#1a2530] text-white dark:bg-[#e67e22] dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Orders ({userOrders.length})</span>
        </button>

      </div>

      {/* TAB: Gated Tier & VIP Membership */}
      {activeTab === 'tier' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Main Tier Overview Hero */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 sm:p-8 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase ${tierConfig.badgeClass}`}>
                    <span>{tierConfig.icon}</span>
                    <span>{tierConfig.badge}</span>
                  </span>
                  {userGatedTier === 'VIP Black' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Subscription Active
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Assigned Tier: {userGatedTier}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Your tier is determined automatically based on your cumulative shopping spend across all stores. As you purchase items, your tier automatically levels up with bigger discounts and unlocked exclusive catalogs.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-amber-300 font-semibold flex items-center space-x-1.5">
                    <Percent className="w-4 h-4" />
                    <span>{tierConfig.discountPercent}% Automatic Store Discount</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{tierConfig.shippingPerk}</span>
                  </div>
                </div>
              </div>

              {/* Spend Meter & Simulator */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-700/80 md:w-96 space-y-4 shadow-xl">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Lifetime Store Spend:
                  </span>
                  <span className="text-xl font-mono font-extrabold text-white">
                    ${tierProgress.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {!tierProgress.isMaxSpendTier && !tierProgress.isVipBlack ? (
                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, tierProgress.progressPercent)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{tierProgress.currentTier} (${tierProgress.minSpendRequired})</span>
                      <span className="font-bold text-amber-300">
                        ${tierProgress.remainingSpend.toFixed(2)} to {tierProgress.nextTier}
                      </span>
                      <span>{tierProgress.nextTier} (${tierProgress.targetSpend})</span>
                    </div>
                  </div>
                ) : tierProgress.isVipBlack ? (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center space-x-2 font-bold">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>VIP Black Subscription Unlocked Full Access</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2 font-bold">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Max Spend Tier Achieved (Gold)</span>
                  </div>
                )}

                {/* Simulation Buttons for User Testing */}
                <div className="pt-3 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 mb-2">
                    Test Auto-Tier Upgrades (Simulate Spend):
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => dispatch(simulateAddSpend(250))}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-amber-400" />
                      <span>+$250</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch(simulateAddSpend(1000))}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-amber-400" />
                      <span>+$1,000</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch(simulateAddSpend(2500))}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-amber-400" />
                      <span>+$2,500</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Tier Matrix Table */}
          <div className="bg-white dark:bg-[#1a2530] rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#e67e22]" />
              <span>Spend-Based Shopper Tiers & Discount Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#9aa8b2] mb-6">
              Tiers are awarded based on your store spending over time. Earn higher tiers to receive automatic cart discounts, reduced shipping rates, and exclusive offers.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="pb-3 pr-4">Tier Level</th>
                    <th className="pb-3 px-4">Spend Qualification</th>
                    <th className="pb-3 px-4">Automatic Discount</th>
                    <th className="pb-3 px-4">Shipping Privilege</th>
                    <th className="pb-3 pl-4">Exclusive Member Offers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.values(GATED_TIERS).map((t) => {
                    const isCurrent = userGatedTier === t.level;
                    return (
                      <tr key={t.level} className={`transition-colors ${isCurrent ? 'bg-amber-500/10 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${t.badgeClass}`}>
                              <span>{t.icon}</span>
                              <span>{t.name}</span>
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-extrabold text-[10px]">
                                CURRENT
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {t.level === 'VIP Black' ? (
                            <span className="font-bold text-amber-500 dark:text-amber-400">$99/month Subscription</span>
                          ) : (
                            <span>${t.minSpend.toLocaleString()} Cumulative Spend</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {t.discountPercent}% Off All Orders
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {t.shippingPerk}
                        </td>
                        <td className="py-3.5 pl-4 text-slate-700 dark:text-slate-200">
                          {t.level === 'VIP Black' ? (
                            <span className="text-amber-600 dark:text-amber-400 font-bold">15% Off + 1-Day Priority Air + White-Glove VIP</span>
                          ) : t.level === 'Gold' ? (
                            <span>10% Off + Free Shipping + Priority Picking</span>
                          ) : t.level === 'Silver' ? (
                            <span>5% Off + Free Shipping over $75</span>
                          ) : (
                            <span>Base member pricing on all invited stores</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* VIP Black Subscription Management Section */}
          <div className="bg-white dark:bg-[#1a2530] rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    VIP Black Subscription Membership
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#9aa8b2] mt-0.5">
                    Unlock instant top-tier 15% discounts, 1-day priority shipping on all orders, and access to the Apex Black exclusive store.
                  </p>
                </div>
              </div>

              {currentUser?.isVipBlackSubscribed ? (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => dispatch(cancelVipBlackSubscription())}
                    className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel VIP Membership
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVipModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Manage Card
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsVipModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer active:scale-98"
                >
                  <Crown className="w-4 h-4 fill-slate-950" />
                  <span>Subscribe to VIP Black ($99/mo)</span>
                </button>
              )}
            </div>

            {currentUser?.isVipBlackSubscribed ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold block">Status: Active</span>
                  <span className="text-slate-600 dark:text-slate-300 mt-1 block">Renews on {currentUser.vipBlackExpiresAt || 'September 1, 2026'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-700 dark:text-slate-300 font-bold block">Current Plan</span>
                  <span className="text-slate-500 dark:text-slate-400 mt-1 block">VIP Black Monthly Tier ($99/mo)</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-700 dark:text-slate-300 font-bold block">Payment Method</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 mt-1 block">•••• •••• •••• 4242</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span>You are currently on the spend-based <strong>{userGatedTier} Tier</strong>. Subscribe anytime to bypass spend requirements and unlock VIP Black privileges instantly.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 1: Personal Information (Name, Mobile, Email, Avatar) */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info Card / Form */}
          <div className="lg:col-span-8 bg-white dark:bg-[#1a2530] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Shopper Profile Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#9aa8b2] mt-0.5">
                  Manage your personal name, contact mobile number, email, and preferences for online orders.
                </p>
              </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-[#e67e22] hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* Avatar Selector */}
              {isEditingProfile && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Choose Profile Photo:
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(preset.url)}
                        className={`relative rounded-xl overflow-hidden p-0.5 transition-all cursor-pointer ${
                          selectedAvatar === preset.url
                            ? 'ring-3 ring-[#e67e22] scale-105 shadow-md'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-12 h-12 rounded-lg object-cover" />
                        {selectedAvatar === preset.url && (
                          <div className="absolute inset-0 bg-[#e67e22]/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      disabled={!isEditingProfile}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none disabled:opacity-85 disabled:cursor-not-allowed"
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobile / Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      disabled={!isEditingProfile}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. +1 (512) 890-2144"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none disabled:opacity-85 disabled:cursor-not-allowed"
                    />
                    <Phone className="w-4 h-4 text-[#e67e22] absolute left-3 top-3" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#9aa8b2] mt-1">
                    Used for order dispatch notifications and delivery updates.
                  </p>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      disabled={!isEditingProfile}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sarah.jenkins@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none disabled:opacity-85 disabled:cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#9aa8b2] mt-1">
                    Order confirmations and receipts will be sent here.
                  </p>
                </div>

              </div>

              {/* Primary Address Quick View / Edit */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                      <MapPin className="w-3.5 h-3.5 text-[#e67e22] mr-1.5" />
                      Default Shipping Address
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-[#9aa8b2]">
                      Your primary destination for quick 1-click checkout.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('addresses')}
                    className="text-xs font-bold text-[#e67e22] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <span>Manage All Addresses</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {currentUser.address ? (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 flex items-start justify-between">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {currentUser.address.recipientName || currentUser.fullName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e67e22]/15 text-[#e67e22]">
                          {currentUser.address.label || 'Home'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        {currentUser.address.street}
                        {currentUser.address.apartment ? `, ${currentUser.address.apartment}` : ''}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">
                        {currentUser.address.city}, {currentUser.address.state} {currentUser.address.zipCode}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {currentUser.address.country}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => currentUser.address && handleOpenEditAddressModal(currentUser.address)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <p className="text-xs text-slate-500 mb-2">No default shipping address configured yet.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddressModal}
                      className="px-3.5 py-1.5 rounded-lg bg-[#e67e22] text-white text-xs font-bold hover:bg-[#d35400] transition-colors cursor-pointer"
                    >
                      Add Shipping Address
                    </button>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              {isEditingProfile && (
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer active:scale-98"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </button>
                </div>
              )}

            </form>
          </div>

          {/* Right Summary Card (Account Snapshot & Quick Stores) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Profile Snapshot */}
            <div className="bg-white dark:bg-[#1a2530] rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-[#e67e22] mr-1.5" />
                Live Contact Summary
              </h4>

              <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <div className="pt-2 first:pt-0 flex items-start justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Username:</span>
                  <span className="font-mono font-bold text-[#e67e22] text-right">@{currentUser.username}</span>
                </div>

                <div className="pt-2 flex items-start justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Full Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right">{currentUser.fullName}</span>
                </div>

                <div className="pt-2 flex items-start justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Mobile Phone:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-right">
                    {currentUser.mobileNumber || currentUser.phone || 'None set'}
                  </span>
                </div>

                <div className="pt-2 flex items-start justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Email:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 text-right truncate max-w-[170px]">
                    {currentUser.email}
                  </span>
                </div>

                <div className="pt-2 flex items-start justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Address:</span>
                  <span className="text-slate-800 dark:text-slate-200 text-right text-[11px] leading-relaxed max-w-[180px]">
                    {currentUser.address?.street ? (
                      <>
                        {currentUser.address.street}, {currentUser.address.city}, {currentUser.address.state} {currentUser.address.zipCode}
                      </>
                    ) : (
                      'No address set'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Accessible Stores Mini List */}
            <div className="bg-white dark:bg-[#1a2530] rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                  <StoreIcon className="w-3.5 h-3.5 text-[#e67e22] mr-1.5" />
                  Your Accessible Stores ({grantedStores.length})
                </h4>
                <button
                  onClick={() => dispatch(setCurrentView('dashboard'))}
                  className="text-[11px] font-bold text-[#e67e22] hover:underline cursor-pointer"
                >
                  Shop Now
                </button>
              </div>

              <div className="space-y-2.5">
                {grantedStores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => {
                      dispatch(setActiveStore(store.id));
                      dispatch(setCurrentView('store_catalog'));
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-[#e67e22] dark:hover:border-[#e67e22] transition-all cursor-pointer flex items-center space-x-3"
                  >
                    <img
                      src={store.logoUrl}
                      alt={store.name}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {store.name}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ {store.accessTier} Access
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: Security & Password Management (Change Password Anytime) */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 bg-white dark:bg-[#1a2530] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#e67e22]/15 text-[#e67e22] flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Security & Password Settings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#9aa8b2]">
                    Change your store-issued temporary password to your personal permanent password anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Current Credentials Status Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                <KeyRound className="w-3.5 h-3.5 text-[#e67e22] mr-1.5" />
                Account Credentials Overview
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Assigned Username</span>
                  <span className="text-sm font-mono font-bold text-[#e67e22]">@{currentUser.username}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Assigned by the store</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Password Status</span>
                  {currentUser.isTemporaryPassword ? (
                    <div className="flex items-center space-x-1.5 mt-0.5 text-amber-600 dark:text-amber-400 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Using Temp Password</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 mt-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Custom Password Active</span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {currentUser.passwordChangedAt 
                      ? `Updated on ${new Date(currentUser.passwordChangedAt).toLocaleDateString()}` 
                      : 'Store default initial password'}
                  </p>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Update or Change Your Password
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Password (or Store Temp Password) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={currentOrTempPassword}
                    onChange={(e) => setCurrentOrTempPassword(e.target.value)}
                    placeholder="Enter current or temporary password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword || !newPassword || !confirmNewPassword}
                  className="px-5 py-2.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isChangingPassword ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save New Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#1a2530] rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mr-1.5" />
                Store Credential Guide
              </h4>
              <p className="text-xs text-slate-600 dark:text-[#9aa8b2] leading-relaxed">
                When stores grant you shopping access, they generate a <strong>Username</strong> and issue a <strong>Temporary Password</strong>.
              </p>
              <ul className="text-xs text-slate-600 dark:text-[#9aa8b2] space-y-2 list-disc pl-4">
                <li>You can sign in with your Username and Temporary Password.</li>
                <li>You can change your password here in your profile at any time.</li>
                <li>Your new password will become your permanent login credential.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Delivery Addresses (Address Book) */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Saved Delivery Addresses
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9aa8b2] mt-0.5">
                Add, edit, and organize your home, office, and family delivery locations for fast online checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddAddressModal}
              className="px-4 py-2.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedAddressesList.map((addr, index) => {
              const isDefault = addr.isDefault || (!currentUser.savedAddresses && index === 0);
              const label = addr.label || (index === 0 ? 'Home' : 'Other');

              return (
                <div
                  key={addr.id || index}
                  className={`rounded-2xl border p-5 transition-all relative flex flex-col justify-between ${
                    isDefault
                      ? 'border-[#e67e22] bg-amber-50/40 dark:bg-amber-950/20 shadow-md ring-2 ring-[#e67e22]'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2530] hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Top Row: Label Badge & Default Pill */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {label === 'Home' && <Home className="w-3.5 h-3.5 text-[#e67e22]" />}
                        {label === 'Work' && <Briefcase className="w-3.5 h-3.5 text-blue-500" />}
                        {label === 'Other' && <MapPin className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{label}</span>
                      </span>

                      {isDefault ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e67e22] text-white flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Default</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addr.id && dispatch(setDefaultAddress(addr.id))}
                          className="text-[11px] font-semibold text-slate-500 hover:text-[#e67e22] dark:hover:text-[#e67e22] transition-colors cursor-pointer"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>

                    {/* Recipient Details */}
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {addr.recipientName || currentUser.fullName}
                      </p>
                      
                      <p className="leading-relaxed">
                        {addr.street}
                        {addr.apartment ? `, ${addr.apartment}` : ''}
                      </p>
                      
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {addr.country}
                      </p>

                      {(addr.phone || currentUser.mobileNumber) && (
                        <p className="pt-2 text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-[#e67e22]" />
                          <span>{addr.phone || currentUser.mobileNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleOpenEditAddressModal(addr)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {savedAddressesList.length > 1 && !isDefault && addr.id && (
                      <button
                        type="button"
                        onClick={() => dispatch(deleteUserAddress(addr.id!))}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: My Orders & Tracking */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                My Purchases & Order History ({userOrders.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9aa8b2] mt-0.5">
                Track current dispatches, review past order summaries, and download receipts.
              </p>
            </div>

            <button
              onClick={() => dispatch(setCurrentView('dashboard'))}
              className="px-4 py-2.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
            >
              <StoreIcon className="w-4 h-4" />
              <span>Browse Store Catalogs</span>
            </button>
          </div>

          {userOrders.length === 0 ? (
            <div className="bg-white dark:bg-[#1a2530] rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
              <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Orders Placed Yet</h4>
              <p className="text-xs text-slate-500 dark:text-[#9aa8b2] mt-1 max-w-sm mx-auto">
                Your completed online purchases and live shipping tracking will appear right here.
              </p>
              <button
                onClick={() => dispatch(setCurrentView('dashboard'))}
                className="mt-4 px-4 py-2 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-[#1a2530] rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {order.status}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-[#9aa8b2]">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-2">
                      <span>{order.items.length} items ordered</span>
                      <span>•</span>
                      <span className="truncate max-w-[260px] text-slate-500 dark:text-[#9aa8b2]">
                        Ship to: {order.shippingAddress.addressLine}, {order.shippingAddress.city}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end md:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Paid</span>
                      <span className="font-mono font-bold text-sm text-[#e67e22]">
                        ${order.grandTotal.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        dispatch(setActiveOrder(order));
                        dispatch(toggleOrderModal(true));
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 hover:bg-[#e67e22] dark:hover:bg-[#e67e22] text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-sm"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Address Add / Edit Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#1a2530] rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-5 h-5 text-[#e67e22]" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    For online shipping and deliveries
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModalAddress} className="p-6 space-y-4 text-xs">
              
              {/* Address Label Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Address Type / Label:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setModalAddrLabel(label)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
                        modalAddrLabel === label
                          ? 'border-[#e67e22] bg-[#e67e22]/15 text-[#e67e22] dark:text-amber-400 font-extrabold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {label === 'Home' && <Home className="w-3.5 h-3.5" />}
                      {label === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                      {label === 'Other' && <MapPin className="w-3.5 h-3.5" />}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Recipient Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalAddrRecipient}
                  onChange={(e) => setModalAddrRecipient(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none"
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalAddrStreet}
                  onChange={(e) => setModalAddrStreet(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none"
                />
              </div>

              {/* Apartment / Suite */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Apartment, Suite, Unit, Building (Optional)
                </label>
                <input
                  type="text"
                  value={modalAddrApartment}
                  onChange={(e) => setModalAddrApartment(e.target.value)}
                  placeholder="e.g. Apt 4B, Floor 2"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none"
                />
              </div>

              {/* City, State, ZIP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalAddrCity}
                    onChange={(e) => setModalAddrCity(e.target.value)}
                    placeholder="e.g. Austin"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalAddrState}
                    onChange={(e) => setModalAddrState(e.target.value)}
                    placeholder="TX"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ZIP / Postal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalAddrZip}
                    onChange={(e) => setModalAddrZip(e.target.value)}
                    placeholder="78759"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Delivery Contact Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={modalAddrPhone}
                    onChange={(e) => setModalAddrPhone(e.target.value)}
                    placeholder="e.g. +1 (512) 890-2144"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#e67e22] focus:outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Set as Default Checkbox */}
              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalAddrIsDefault}
                    onChange={(e) => setModalAddrIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-[#e67e22] focus:ring-[#e67e22] border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Set this as my default shipping address
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer active:scale-98"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingAddressId ? 'Update Address' : 'Save Address'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* VIP Black Subscription Modal */}
      <VipBlackModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
      />

    </div>
  );
};
