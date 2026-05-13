// src/lib/brandUtils.tsx
import React from 'react';
import { ShoppingBag } from 'lucide-react';

export const getStoreBranding = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('zepto')) return { color: 'text-purple-600', bg: 'bg-purple-100', brandBg: 'bg-purple-600', icon: <ShoppingBag className="w-4 h-4" /> };
  if (n.includes('blinkit')) return { color: 'text-amber-600', bg: 'bg-amber-100', brandBg: 'bg-yellow-400', icon: <ShoppingBag className="w-4 h-4" /> };
  if (n.includes('bigbasket')) return { color: 'text-green-600', bg: 'bg-green-100', brandBg: 'bg-green-600', icon: <ShoppingBag className="w-4 h-4 text-white" /> };
  if (n.includes('flipkart')) return { color: 'text-blue-600', bg: 'bg-blue-100', brandBg: 'bg-blue-600', icon: <ShoppingBag className="w-4 h-4" /> };
  return { color: 'text-slate-600', bg: 'bg-slate-100', brandBg: 'bg-slate-500', icon: <ShoppingBag className="w-4 h-4" /> };
};
