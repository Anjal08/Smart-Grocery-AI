"use client";

import React, { useState, useEffect, useMemo } from "react";
import "./ShoppingList.css";
import {
  ShoppingCart,
  Clock,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Sparkles,
  TrendingUp,
  Package,
  Plus,
  Check,
  CheckCircle2,
  Zap,
  Wallet,
  MapPin,
  TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface PredictedItem {
  _id?: string;
  name: string;
  category: string;
  avgIntervalDays: number;
  lastPurchaseDate: string;
  predictedRefillDate: string;
  confidence: number;
  purchaseCount: number;
  price?: number;
  emoji: string;
  savings: number;
}

interface ShoppingList {
  urgent: PredictedItem[];
  soon: PredictedItem[];
  upcoming: PredictedItem[];
}

export default function ShoppingListPage() {
  const [data, setData] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/analytics/shopping-list");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch("/api/analytics/refresh", { method: "POST" });
      await fetchList();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleItem = (name: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(name)) newChecked.delete(name);
    else newChecked.add(name);
    setCheckedItems(newChecked);
  };

  // --- Regroup by Category ---
  const categorizedData = useMemo(() => {
    if (!data) return {};
    const allItems = [...data.urgent, ...data.soon, ...data.upcoming];
    const grouped: Record<string, PredictedItem[]> = {};
    
    allItems.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });
    
    return grouped;
  }, [data]);

  const metrics = useMemo(() => {
    if (!data) return { urgent: 0, total: 0, savings: 0 };
    const allItems = [...data.urgent, ...data.soon, ...data.upcoming];
    const totalEst = allItems.reduce((acc, i) => acc + (i.price || 120), 0);
    const totalSavings = allItems.reduce((acc, i) => acc + (i.savings || 0), 0);
    return {
      urgent: data.urgent.length,
      total: totalEst,
      savings: totalSavings
    };
  }, [data]);

  const getDaysLate = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getCategoryEmoji = (cat: string) => {
    const maps: Record<string, string> = {
      "Dairy": "🥛",
      "Staples": "🛒",
      "Pantry": "🛒",
      "Cleaning": "🧼",
      "Personal Care": "🧴",
      "Produce": "🍎",
      "Bakery": "🍞",
      "Snacks": "🍪"
    };
    return maps[cat] || "📦";
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fdfbf6]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf6] p-6 md:p-12 text-[#0f172a] selection:bg-indigo-100">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* 1. SMART HEADER */}
        <header className="space-y-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">
                     <MapPin className="w-3 h-3" />
                     Lucknow 226028
                   </div>
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100">
                     <Sparkles className="w-3 h-3" />
                     Smart Refill Active
                   </div>
                 </div>
                 <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-[#0f172a]">
                   Smart <span className="text-indigo-600">Cart.</span>
                 </h1>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Total Potential Savings</p>
                <h2 className="text-4xl font-black gradient-text-savings">₹{metrics.savings}</h2>
              </div>
           </div>

           <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={handleRefresh}
                className="glass-card rounded-2xl px-8 py-4 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 border border-slate-200"
              >
                 <RefreshCw size={18} className={isRefreshing ? "animate-spin text-indigo-600" : "text-indigo-600"} />
                 <span className="text-xs font-black uppercase tracking-widest">Refresh Predictions</span>
              </button>
           </div>
        </header>

        {/* 2. MAIN CONTAINER */}
        <main className="space-y-16">
           {Object.entries(categorizedData).map(([category, items], catIdx) => (
             <section key={category} className="space-y-8">
                <div className="flex items-center gap-4">
                   <span className="text-3xl">{getCategoryEmoji(category)}</span>
                   <h2 className="text-sm font-black tracking-[0.3em] text-slate-400 uppercase">{category}</h2>
                   <div className="h-px bg-slate-200 flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {items.map((item, i) => {
                     const isChecked = checkedItems.has(item.name);
                     const lateDays = getDaysLate(item.predictedRefillDate);

                     return (
                       <motion.div
                         layout
                         key={item.name}
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: catIdx * 0.1 + i * 0.05 }}
                         onClick={() => toggleItem(item.name)}
                         className={`group glass-card p-6 rounded-[32px] cursor-pointer transition-all duration-500 relative overflow-hidden ${
                           isChecked ? "checked-card" : ""
                         }`}
                       >
                          {/* Savings Badge */}
                          {!isChecked && (
                            <div className="absolute top-6 right-6">
                              <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                                Save ₹{item.savings}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-6">
                             {/* Emoji Circle (40px) */}
                             <div className="w-16 h-16 rounded-2xl emoji-circle flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                                {item.emoji}
                             </div>

                             <div className="flex-1 min-w-0">
                                <h3 className={`font-black text-lg tracking-tight transition-all truncate ${isChecked ? 'line-through text-slate-300' : 'text-[#0f172a]'}`}>
                                  {item.name}
                                </h3>
                                <div className="flex items-center gap-3 mt-1">
                                   <span className="text-sm font-black text-indigo-600">₹{item.price || 120}</span>
                                   <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                      {item.category}
                                   </span>
                                </div>
                                {!isChecked && (
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-1.5">
                                    <Clock size={12} className={lateDays > 0 ? "text-rose-500" : ""} />
                                    <span className={lateDays > 0 ? "text-rose-500" : ""}>
                                      {lateDays > 0 ? `Late by ${lateDays} days` : 'Refill soon'}
                                    </span>
                                  </p>
                                )}
                             </div>
                          </div>
                       </motion.div>
                     );
                   })}
                </div>
             </section>
           ))}

           {(!data || Object.keys(categorizedData).length === 0) && (
              <div className="py-24 text-center space-y-6 bg-white/50 rounded-[48px] border border-slate-100 shadow-sm">
                 <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-[#0f172a]">Fully Stocked.</h3>
                    <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto uppercase tracking-widest leading-relaxed mt-2">
                      Your pantry in Lucknow is fully optimized.
                    </p>
                 </div>
              </div>
           )}
        </main>

        <footer className="pt-12 text-center opacity-40">
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
             Smart Cart AI • Frosted Light Edition • 2026
           </p>
        </footer>

      </div>
    </div>
  );
}
