"use client";

import React, { useState, useMemo } from 'react';
import { Check, ShoppingBasket, IndianRupee, ListChecks } from 'lucide-react';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  price: number;
  checked: boolean;
}

// Absolute mock data fallback
const MOCK_DATA: GroceryItem[] = [
  { id: '1', name: 'Organic Whole Milk', category: 'Dairy & Eggs', quantity: '1L', price: 85, checked: false },
  { id: '2', name: 'Farm Fresh Brown Eggs', category: 'Dairy & Eggs', quantity: '12 Pack', price: 110, checked: false },
  { id: '3', name: 'Amul Butter', category: 'Dairy & Eggs', quantity: '500g', price: 260, checked: true },
  
  { id: '4', name: 'Fortune Chakki Fresh Atta', category: 'Grains & Staples', quantity: '5kg', price: 210, checked: true },
  { id: '5', name: 'Premium Basmati Rice', category: 'Grains & Staples', quantity: '1kg', price: 140, checked: false },
  
  { id: '6', name: 'Hass Avocados', category: 'Fresh Produce', quantity: '2 pcs', price: 150, checked: false },
  { id: '7', name: 'Roma Tomatoes', category: 'Fresh Produce', quantity: '1kg', price: 45, checked: false },
  { id: '8', name: 'Fresh Coriander', category: 'Fresh Produce', quantity: '1 bunch', price: 20, checked: false },
  
  { id: '9', name: 'Tide Pods', category: 'Household', quantity: '32 count', price: 350, checked: false },
  { id: '10', name: 'Kitchen Towels', category: 'Household', quantity: '2 rolls', price: 120, checked: true },
];

export default function SmartCategoryGroceryBoard() {
  const [items, setItems] = useState<GroceryItem[]>(MOCK_DATA);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // Calculate dynamic header statistics
  const totalExpenditure = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  const activeCount = useMemo(() => {
    return items.filter(item => !item.checked).length;
  }, [items]);

  // Group items into a categorization matrix
  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, GroceryItem[]>);
  }, [items]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 1. HEADER OVERVIEW TICKER */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[32px] p-8 shadow-2xl shadow-slate-900/20 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 w-full md:w-auto text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex flex-col md:flex-row items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <ShoppingBasket className="w-8 h-8 text-indigo-400" />
              </div>
              Smart Grocery Board
            </h1>
            <p className="text-slate-400 font-medium mt-3 md:mt-2 text-sm md:text-base">
              Automated category-optimized procurement matrix.
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4 relative z-10 w-full md:w-auto">
            {/* Active Items Counter */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 w-full md:w-36 text-center shadow-inner">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 mb-2">
                <ListChecks className="w-3.5 h-3.5" /> Active
              </p>
              <p className="text-4xl font-black text-white">{activeCount}</p>
            </div>
            
            {/* Total Expenditure Counter */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 w-full md:w-40 text-center shadow-inner">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 mb-2">
                <IndianRupee className="w-3.5 h-3.5" /> Total
              </p>
              <p className="text-4xl font-black text-emerald-400">₹{totalExpenditure}</p>
            </div>
          </div>
        </div>

        {/* 2. GROUPED CATEGORIZATION MATRIX */}
        <div className="space-y-8 pt-4">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              
              {/* Category Header */}
              <div className="bg-slate-50/80 border-b border-slate-100 px-8 py-5 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {category}
                </h2>
                <span className="text-xs font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                  {categoryItems.filter(i => !i.checked).length} items remaining
                </span>
              </div>
              
              {/* Items List */}
              <div className="divide-y divide-slate-50">
                {categoryItems.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="group px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-5">
                      
                      {/* 3. REACTION CHECKBOX SELECTION */}
                      <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                        item.checked 
                          ? 'bg-emerald-500 border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.3)] scale-110' 
                          : 'bg-white border-slate-300 group-hover:border-indigo-400 group-hover:shadow-sm'
                      }`}>
                        {item.checked && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                      </div>

                      <div className="space-y-0.5">
                        <p className={`text-lg font-black transition-all duration-300 ${
                          item.checked ? 'text-gray-300 line-through' : 'text-slate-800'
                        }`}>
                          {item.name}
                        </p>
                        <p className={`text-sm font-bold transition-all duration-300 ${
                          item.checked ? 'text-gray-200' : 'text-slate-400'
                        }`}>
                          ₹{item.price}
                        </p>
                      </div>
                    </div>

                    {/* 4. QUANTITY BADGES */}
                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                      item.checked 
                        ? 'bg-slate-50 text-slate-300' 
                        : 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                    }`}>
                      {item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
