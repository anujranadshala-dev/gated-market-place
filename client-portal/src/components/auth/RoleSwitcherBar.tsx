import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { switchUserPreset } from '../../store/slices/authSlice';
import { setActiveStore } from '../../store/slices/tenantSlice';
import { PRESET_USERS } from '../../data/mockData';

export const RoleSwitcherBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-[#0b131c] text-white border-b border-slate-800/80 text-xs select-none transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#e67e22]/15 text-amber-300 font-bold text-[10px] uppercase tracking-wider border border-[#e67e22]/30 shadow-xs">
            <KeyRound className="w-3 h-3 mr-1 text-[#e67e22]" /> Shopper Accounts
          </span>
          <span className="text-slate-400 hidden xl:inline text-[11px]">
            Switch shopper profile to preview individual store invitations & spend discount:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_USERS.map((user) => {
            const isSelected = currentUser?.id === user.id;
            return (
              <button
                key={user.id}
                onClick={() => {
                  dispatch(switchUserPreset(user.id));
                  dispatch(setActiveStore(null));
                  navigate('/');
                }}
                title={`Username: @${user.username} | Password: ${user.temporaryPassword} | Invited to: ${user.accessibleStores.length} stores`}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 flex items-center space-x-1.5 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm ring-1 ring-white/30 font-bold'
                    : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-white/20"
                />
                <span>@{user.username}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${isSelected ? 'bg-black/30 text-amber-200' : 'bg-black/40 text-emerald-400'}`}>
                  {user.accessibleStores.length} stores
                </span>
              </button>
            );
          })}

          <button
            onClick={() => {
              navigate('/login');
            }}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center space-x-1 cursor-pointer transition-colors active:scale-95"
          >
            <KeyRound className="w-3 h-3 text-amber-400" />
            <span>Store Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};

