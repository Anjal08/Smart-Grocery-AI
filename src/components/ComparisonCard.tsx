"use client";

import React from 'react';
import { ExternalLink, Crown, Clock, Zap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComparisonCardProps {
  platform: string;
  price: number;
  available: boolean;
  deliveryTime: string;
  isBestValue: boolean;
  deepLink: string;
  icon: string;
  color: string;
  lastScraped: string;
  emoji?: string;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  platform,
  price,
  available,
  deliveryTime,
  isBestValue,
  deepLink,
  icon,
  color,
  lastScraped,
  emoji
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex items-center justify-between p-6 rounded-[28px] border transition-all duration-300 group ${
        available 
          ? isBestValue 
            ? 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-100/50 scale-[1.01]' 
            : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/30'
          : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
      }`}
    >
      {/* Best Value Ribbon */}
      {available && isBestValue && (
        <div className="absolute -top-3 left-10">
          <div className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md shadow-emerald-200/50 flex items-center gap-1.5">
            <Crown className="w-3 h-3" />
            Best Value
          </div>
        </div>
      )}

      <div className="flex items-center gap-6 flex-1">
        {/* Store Logo/Icon Area */}
        <div 
          className={`w-14 h-14 rounded-2xl flex items-center justify-center p-2 shadow-sm transition-transform group-hover:scale-110 duration-300 ${
            isBestValue ? 'bg-white' : 'bg-slate-50'
          }`}
          style={{ border: `1px solid ${color}20` }}
        >
          {icon ? (
            <img src={icon} alt={platform} className="w-full h-full object-contain" />
          ) : (
            <span className="text-2xl">{emoji || "📦"}</span>
          )}
        </div>

        {/* Store Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-black text-slate-800">{platform}</h4>
            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{lastScraped}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              <Zap className="w-3 h-3 fill-current" />
              {deliveryTime || '10-15 min'}
            </div>
            {!available && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                <AlertCircle className="w-3 h-3" />
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price and Action */}
      <div className="flex items-center gap-8 text-right">
        <div className="space-y-0.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Price</p>
          <p className={`text-3xl font-black ${available ? (isBestValue ? 'text-emerald-600' : 'text-slate-900') : 'text-slate-300'}`}>
            {available ? `₹${price}` : '--'}
          </p>
        </div>

        {available && deepLink && deepLink !== "#" && (
          <button
            onClick={() => window.open(deepLink, "_blank")}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black transition-all active:scale-95 shadow-lg ${
              isBestValue 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200' 
                : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200'
            }`}
          >
            Verify <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
