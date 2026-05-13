"use client";

import React from 'react';
import { LucideIcon, Carrot, Cookie, Milk, Wheat, Package } from 'lucide-react';

interface ProductThumbnailProps {
  category: string;
  imageUrl?: string;
  name: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; icon: LucideIcon; color: string }> = {
  "VEGETABLES & FRUITS": { bg: "bg-[#DCFCE7]", icon: Carrot, color: "text-emerald-600" },
  "Fresh Produce": { bg: "bg-[#DCFCE7]", icon: Carrot, color: "text-emerald-600" },
  "Vegetables & Fruits": { bg: "bg-[#DCFCE7]", icon: Carrot, color: "text-emerald-600" },
  "DAIRY": { bg: "bg-[#DBEAFE]", icon: Milk, color: "text-blue-600" },
  "Dairy & Bakery": { bg: "bg-[#DBEAFE]", icon: Milk, color: "text-blue-600" },
  "Snacks & Drinks": { bg: "bg-[#FEF3C7]", icon: Cookie, color: "text-amber-600" },
  "SNACKS": { bg: "bg-[#FEF3C7]", icon: Cookie, color: "text-amber-600" },
  "Staples": { bg: "bg-[#F3E8FF]", icon: Wheat, color: "text-purple-600" },
  "STAPLES": { bg: "bg-[#F3E8FF]", icon: Wheat, color: "text-purple-600" },
};

const DEFAULT_STYLE = { bg: "bg-slate-100", icon: Package, color: "text-slate-400" };

const ProductThumbnail: React.FC<ProductThumbnailProps> = ({ category, imageUrl, name }) => {
  const style = CATEGORY_STYLES[category] || DEFAULT_STYLE;
  const Icon = style.icon;

  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${style.bg}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <Icon size={20} className={style.color} />
      )}
    </div>
  );
};

export default ProductThumbnail;
