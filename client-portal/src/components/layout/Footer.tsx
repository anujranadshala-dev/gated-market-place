import React from 'react';
import { Shield, Lock, Cpu, Server, CheckCircle, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenArchitecture: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenArchitecture }) => {
  return (
    <footer className="w-full bg-[#1a2530] text-slate-300 border-t border-slate-700/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: System Identity */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#e67e22] flex items-center justify-center text-white shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">
                Nexus<span className="text-[#e67e22]">Gate</span>
              </span>
            </div>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Enterprise B2B2C Gated Multi-Tenant Marketplace Client. Strict cryptographic access control, dynamic tiered volume discounts, and asynchronous order pipelines.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-amber-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Encrypted Multi-Tenant Vault Active</span>
            </div>
          </div>

          {/* Col 2: Architectural Specs */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              MERN Client Stack
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300/90">
              <li className="flex items-center space-x-1.5">
                <span className="text-[#e67e22]">▪</span>
                <span>React 19 + TypeScript + Vite</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="text-[#e67e22]">▪</span>
                <span>Redux Toolkit Global Slices</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="text-[#e67e22]">▪</span>
                <span>Tailwind CSS v4 Warm Theme</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="text-[#e67e22]">▪</span>
                <span>Express & Mongo Schema Models</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Gated Compliance */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Security & Compliance
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300/90">
              <li className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Single-Use Magic Link Auth</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Tenant Access Policy</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>B2B PO & NET 30 Authorization</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dynamic Quantity Tier Engine</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Developer Portfolio Actions */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Architecture Blueprint
            </h4>
            <p className="text-xs text-slate-300/80 mb-3">
              Explore full component outlines, Mongoose schemas, Redux setup, and scaffolding commands.
            </p>
            <button
              onClick={onOpenArchitecture}
              className="w-full inline-flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>Inspect Full-Stack Blueprint</span>
            </button>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <p>© 2026 NexusGate B2B2C Gated Marketplace Architecture. Built for enterprise portfolio verification.</p>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span className="text-[#9aa8b2]">REST API v2.4</span>
            <span>•</span>
            <span className="text-[#9aa8b2]">MongoDB Mongoose Models</span>
            <span>•</span>
            <span className="text-[#9aa8b2]">Redux Toolkit 2.x</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
