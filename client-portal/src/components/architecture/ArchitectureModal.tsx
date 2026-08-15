import React, { useState } from 'react';
import { 
  X, 
  FileCode, 
  FolderTree, 
  Terminal, 
  Database, 
  Layers, 
  Copy, 
  Check, 
  Server, 
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ARCHITECTURE_BLUEPRINT } from '../../data/architectureDocs';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'scaffolding' | 'structure' | 'redux' | 'mongoose' | 'express'>('scaffolding');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'scaffolding':
        return ARCHITECTURE_BLUEPRINT.scaffoldingCommands.trim();
      case 'structure':
        return ARCHITECTURE_BLUEPRINT.folderStructure.trim();
      case 'mongoose':
        return ARCHITECTURE_BLUEPRINT.mongooseSchemas.trim();
      case 'express':
        return ARCHITECTURE_BLUEPRINT.expressRoutes.trim();
      case 'redux':
        return `// ==============================================================
// Redux Toolkit Root Store & Gated Tenant Slices Architecture
// ==============================================================
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';       // Session, accessibleStores[], magicTokens
import tenantReducer from './slices/tenantSlice';   // Multi-tenant stores, catalogs, filters
import cartReducer from './slices/cartSlice';       // Tiered bulk discounts, taxes, checkout
import orderReducer from './slices/orderSlice';     // Pending B2B orders & lifecycle
import themeReducer from './slices/themeSlice';     // Light / Dark mode persistence

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenant: tenantReducer,
    cart: cartReducer,
    order: orderReducer,
    theme: themeReducer
  }
});

// Dynamic Volume Pricing Engine in Redux cartSlice:
export function calculateTierPricing(product: Product, quantity: number) {
  let appliedUnitPrice = product.basePrice;
  let appliedDiscountPercent = 0;

  const sortedTiers = [...product.priceTiers].sort((a, b) => b.minQuantity - a.minQuantity);
  for (const tier of sortedTiers) {
    if (quantity >= tier.minQuantity) {
      appliedUnitPrice = tier.unitPrice;
      appliedDiscountPercent = tier.discountPercentage;
      break;
    }
  }

  return {
    appliedUnitPrice,
    appliedDiscountPercent,
    itemSubtotal: appliedUnitPrice * quantity,
    itemTax: (appliedUnitPrice * quantity) * product.taxRate
  };
}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#161f28] rounded-2xl border border-slate-200 dark:border-slate-700 max-w-5xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-8 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1a2530] text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#e67e22] text-white flex items-center justify-center shadow-md">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Full-Stack Architecture & Component Outlines
              </h2>
              <p className="text-xs text-amber-200">
                MERN Stack Gated Multi-Tenant B2B2C Marketplace Architecture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scaffolding')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors flex items-center space-x-2 cursor-pointer ${
              activeTab === 'scaffolding'
                ? 'bg-white dark:bg-[#161f28] text-[#e67e22] border-t-2 border-t-[#e67e22] border-x border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>1. Vite Scaffolding</span>
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors flex items-center space-x-2 cursor-pointer ${
              activeTab === 'structure'
                ? 'bg-white dark:bg-[#161f28] text-[#e67e22] border-t-2 border-t-[#e67e22] border-x border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>2. Folder Structure</span>
          </button>

          <button
            onClick={() => setActiveTab('redux')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors flex items-center space-x-2 cursor-pointer ${
              activeTab === 'redux'
                ? 'bg-white dark:bg-[#161f28] text-[#e67e22] border-t-2 border-t-[#e67e22] border-x border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Redux Toolkit Slices</span>
          </button>

          <button
            onClick={() => setActiveTab('mongoose')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors flex items-center space-x-2 cursor-pointer ${
              activeTab === 'mongoose'
                ? 'bg-white dark:bg-[#161f28] text-[#e67e22] border-t-2 border-t-[#e67e22] border-x border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>4. Mongoose Schemas</span>
          </button>

          <button
            onClick={() => setActiveTab('express')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors flex items-center space-x-2 cursor-pointer ${
              activeTab === 'express'
                ? 'bg-white dark:bg-[#161f28] text-[#e67e22] border-t-2 border-t-[#e67e22] border-x border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>5. Express API Routes</span>
          </button>
        </div>

        {/* Code Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-100 font-mono text-xs relative">
          
          {/* Copy Button */}
          <div className="sticky top-0 right-0 flex justify-end mb-2 z-10">
            <button
              onClick={() => handleCopy(getActiveContent())}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1.5 border border-slate-700 shadow-md cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code Outline</span>
                </>
              )}
            </button>
          </div>

          <pre className="overflow-x-auto leading-relaxed p-4 rounded-xl bg-black/40 border border-slate-800 selection:bg-[#e67e22] selection:text-white">
            <code>{getActiveContent()}</code>
          </pre>
        </div>

        {/* Footer Summary */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Cryptographic multi-tenant access filter enforced across all layers.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold transition-colors self-end sm:self-center cursor-pointer"
          >
            Close Blueprint
          </button>
        </div>

      </div>
    </div>
  );
};
