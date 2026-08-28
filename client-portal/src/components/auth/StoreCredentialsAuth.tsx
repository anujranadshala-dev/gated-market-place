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
  User as UserIcon,
  HelpCircle
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { loginWithCredentials, clearLoginError } from '../../store/slices/authSlice';
import confetti from 'canvas-confetti';

interface StoreCredentialsAuthProps {
  onSuccessRedirect?: () => void;
}

export const StoreCredentialsAuth: React.FC<StoreCredentialsAuthProps> = ({ 
  onSuccessRedirect 
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { verificationLoading, verificationError, loginLoading, loginError } = useAppSelector((state) => state.auth);

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Please enter both your username/email and password.');
      return;
    }

    setErrorMessage(null);
    dispatch(clearLoginError());

    try {
      await dispatch(loginWithCredentials({
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim()
      })).unwrap();
      
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
    } catch (error: any) {
      setLoginSuccess(false);
      setErrorMessage(error || 'Login failed. Please check your credentials.');
    }
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
          Enter your store-issued <strong>Username</strong> and <strong>Password</strong> to access your authorized stores.
        </p>
      </div>

      <div className="bg-white dark:bg-[#212832] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Enter Credentials
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9aa8b2] mt-0.5">
              Use your store-provided username and password
            </p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure Login</span>
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
                placeholder="e.g. sarah.shopper or sarah@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
              />
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-[#2988c8] font-semibold">
                (Provided by your store)
              </span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          {(errorMessage || verificationError || loginError) && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage || verificationError || loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading || loginSuccess}
            className="w-full py-3.5 rounded-xl bg-[#2988c8] hover:bg-[#d97d10] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75 active:scale-98"
          >
            {loginLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing In...</span>
              </>
            ) : loginSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Success! Redirecting...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Shopper Note */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-[#9aa8b2] flex items-start space-x-2">
          <HelpCircle className="w-3.5 h-3.5 text-[#2988c8] shrink-0 mt-0.5" />
          <p>
            If you haven't received your credentials, please contact the store administrator or check your welcome email.
          </p>
        </div>
      </div>

    </div>
  );
};
