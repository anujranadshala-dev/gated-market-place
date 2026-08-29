import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { changeUserPasswordApi, clearPasswordError } from '../../store/slices/authSlice';
import confetti from 'canvas-confetti';

export const ForcePasswordChange: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser, passwordLoading, passwordError } = useAppSelector((state) => state.auth);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser?.isTemporaryPassword) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearPasswordError());

    if (newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      await dispatch(changeUserPasswordApi({
        currentPassword: '',
        newPassword
      })).unwrap();

      setSuccess(true);

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      setLocalError(error.message || 'Failed to change password');
    }
  };

  if (!currentUser?.isTemporaryPassword) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#171c23] px-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#212832] via-slate-800 to-[#2988c8] text-amber-400 mb-4 shadow-xl ring-4 ring-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Set Your Password
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#9aa8b2] mt-2 max-w-xl mx-auto leading-relaxed">
            You are using a temporary password. Please set a new permanent password to continue.
          </p>
        </div>

        <div className="bg-white dark:bg-[#212832] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#9aa8b2] mt-0.5">
                Welcome, <strong>{currentUser.fullName}</strong> (@{currentUser.username})
              </p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>First Login</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2988c8] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {(localError || passwordError) && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{localError || passwordError}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Password changed successfully! Redirecting...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading || success}
              className="w-full py-3.5 rounded-xl bg-[#2988c8] hover:bg-[#d97d10] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75 active:scale-98"
            >
              {passwordLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating Password...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Success!</span>
                </>
              ) : (
                <>
                  <span>Set New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-[#9aa8b2] flex items-start space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2988c8] shrink-0 mt-0.5" />
            <p>
              Your password must be at least 6 characters long. After setting your new password, you will have full access to the client portal.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
