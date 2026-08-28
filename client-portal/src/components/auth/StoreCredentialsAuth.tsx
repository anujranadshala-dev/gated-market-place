import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  KeyRound, 
  ShieldCheck, 
  CheckCircle, 
  ArrowRight, 
  Lock, 
  Mail, 
  Store as StoreIcon, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RefreshCw,
  User as UserIcon,
  HelpCircle,
  Clock,
  Send,
  Key
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { loginWithCredentials } from '../../store/slices/authSlice';
import { STORE_ISSUED_CREDENTIALS, PRESET_USERS } from '../../data/mockData';
import confetti from 'canvas-confetti';

interface StoreCredentialsAuthProps {
  onSuccessRedirect?: () => void;
}

export const StoreCredentialsAuth: React.FC<StoreCredentialsAuthProps> = ({ 
  onSuccessRedirect 
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { verificationLoading, verificationError } = useAppSelector((state) => state.auth);

  const [usernameOrEmail, setUsernameOrEmail] = useState('alex.rivera');
  const [password, setPassword] = useState('Temp#Alex7842');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Please enter both your store-issued username and password.');
      return;
    }

    setErrorMessage(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      dispatch(
        loginWithCredentials({
          usernameOrEmail: usernameOrEmail.trim(),
          password: password.trim()
        })
      );

      setIsLoggingIn(false);
      setLoginSuccess(true);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setTimeout(() => {
        navigate('/');
        if (onSuccessRedirect) onSuccessRedirect();
      }, 1000);
    }, 600);
  };

  const handleUsePresetCredential = (cred: typeof STORE_ISSUED_CREDENTIALS[0]) => {
    setUsernameOrEmail(cred.username);
    setPassword(cred.tempPassword);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#212832] via-slate-800 to-[#2988c8] text-amber-400 mb-4 shadow-xl ring-4 ring-amber-500/10">
          <KeyRound className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Shopper Sign In
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#9aa8b2] mt-2 max-w-xl mx-auto leading-relaxed">
          Stores send new shoppers an assigned <strong>Username</strong> and a <strong>Temporary Password</strong>.
          Sign in below to start shopping. You can change your password anytime from your profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Login Form */}
        <div className="lg:col-span-7 bg-white dark:bg-[#212832] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Enter Store Credentials
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#9aa8b2] mt-0.5">
                Use your store-provided username & temporary password
              </p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Direct Store Login</span>
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Shopper Username or Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="e.g. alex.rivera or alex.rivera@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#9aa8b2] mt-1">
                Your unique handle created by the store.
              </p>
            </div>

            {/* Temporary / Permanent Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password / Store Temporary Password <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-[#2988c8] font-semibold">
                  (Can change later in Profile)
                </span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter temporary or existing password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {(errorMessage || verificationError) && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage || verificationError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || loginSuccess}
              className="w-full py-3.5 rounded-xl bg-[#2988c8] hover:bg-[#d97d10] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75 active:scale-98"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials & Loading Stores...</span>
                </>
              ) : loginSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Success! Entering Marketplace...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Open Stores</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Shopper Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-[#9aa8b2] flex items-start space-x-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#2988c8] shrink-0 mt-0.5" />
            <p>
              Forgot or didn't receive your temporary password? Check your welcome email or select a sample welcome credential on the right to test.
            </p>
          </div>
        </div>

        {/* Right Col: Store Welcome Letters & Temporary Credentials Simulator */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white dark:bg-[#212832] rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-lg space-y-3.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#2988c8]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Store Welcome Letters (Simulator)
              </h3>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-[#9aa8b2] leading-relaxed">
              When a store adds a new shopper, they send a welcome email with their assigned Username and Temporary Password. Click any store invitation below to prefill:
            </p>

            <div className="space-y-3 pt-1">
              {STORE_ISSUED_CREDENTIALS.map((cred) => (
                <div
                  key={cred.id}
                  onClick={() => handleUsePresetCredential(cred)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    usernameOrEmail === cred.username
                      ? 'border-[#2988c8] bg-amber-50/70 dark:bg-amber-950/40 ring-1 ring-[#2988c8]'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={cred.storeLogo}
                      alt={cred.storeName}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {cred.storeName}
                        </p>
                        <span className="text-[10px] text-slate-400">{cred.issuedAt}</span>
                      </div>
                      
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        For: <strong className="text-slate-800 dark:text-slate-100">{cred.recipientName}</strong>
                      </p>

                      {/* Username & Temp Password Badges */}
                      <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="text-slate-400 block text-[9px]">USERNAME</span>
                          <span className="text-[#2988c8] font-bold truncate block">{cred.username}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="text-slate-400 block text-[9px]">TEMP PASSWORD</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate block">
                            {cred.tempPassword}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between pt-1 text-[10px] font-semibold text-[#2988c8]">
                        <span>Click to Auto-Fill & Test</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-2.5">
            <Key className="w-4 h-4 text-[#2988c8] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Password Flexibility:</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                Shoppers can change their password at any time from <strong>My Profile</strong> &gt; <strong>Security & Password</strong>.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
