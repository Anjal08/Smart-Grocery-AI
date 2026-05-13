"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  BrainCircuit, Loader2, TrendingUp, TrendingDown, 
  Sparkles, Coffee, ShoppingBasket, GlassWater, 
  ChevronRight, Plus, Package, Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types & Constants ---
interface PantryItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  purchaseDate: string;
}

const CATEGORY_PALETTE = [
  { name: "Fresh Produce", color: "#059669", icon: ShoppingBasket }, // Deep Emerald
  { name: "Dairy & Bakery", color: "#1E293B", icon: Coffee },      // Midnight Blue
  { name: "Snacks & Drinks", color: "#F97316", icon: GlassWater }, // Sunset Orange
  { name: "Staples", color: "#6366F1", icon: Package }             // Indigo fallback
];

export default function AnalyticsPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('/api/pantry');
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        console.error("Failed to load inventory data for analytics", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchItems();
  }, []);

  // --- Calculations ---
  const totalSpend = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  }, [items]);

  const categorySpending = useMemo(() => {
    return items.reduce((acc, item) => {
      let cat = item.category;
      if (cat === "Vegetables & Fruits" || cat === "Fruits" || cat.includes("Produce")) cat = "Fresh Produce";
      if (cat === "Beverages" || cat === "Snacks") cat = "Snacks & Drinks";
      if (cat.includes("Dairy") || cat.includes("Bakery")) cat = "Dairy & Bakery";
      if (!CATEGORY_PALETTE.find(p => p.name === cat)) cat = "Staples";

      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += (item.price || 0) * (item.quantity || 1);
      return acc;
    }, {} as Record<string, number>);
  }, [items]);

  const pieData = Object.entries(categorySpending)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_PALETTE.find(p => p.name === name)?.color || "#CBD5E1"
    }));

  const monthlySavings = 842; // Simulated executive stat

  // Action Tiles: Items with progress bars
  const predictionList = useMemo(() => {
    return items
      .filter(i => ["Dairy & Bakery", "Fresh Produce"].includes(getMappedCategory(i.category)))
      .map(item => {
        const purchase = new Date(item.purchaseDate).getTime();
        const now = new Date().getTime();
        const daysPassed = Math.max(0, (now - purchase) / (1000 * 60 * 60 * 24));
        const shelfLife = item.category.includes("Dairy") ? 5 : 7;
        const progress = Math.max(0, 100 - (daysPassed / shelfLife) * 100);
        return { ...item, progress: Math.round(progress), daysLeft: Math.max(0, Math.floor(shelfLife - daysPassed)) };
      })
      .sort((a, b) => a.progress - b.progress)
      .slice(0, 4);
  }, [items]);

  function getMappedCategory(cat: string): string {
    if (cat.includes("Produce") || cat.includes("Fruit")) return "Fresh Produce";
    if (cat.includes("Dairy") || cat.includes("Bakery")) return "Dairy & Bakery";
    return cat;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 space-y-12">
      
      {/* 1. INSIGHT-DRIVEN HEADER */}
      <header className="space-y-4">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-black text-slate-800 tracking-tighter"
              >
                Welcome back, Executive.
              </motion.h1>
              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Pantry Portfolio Status</p>
            </div>
            
            <div className="bg-white/40 backdrop-blur-md p-6 rounded-[24px] border border-white/20 shadow-xl min-w-[200px] relative overflow-hidden group">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Optimization</p>
               <div className="flex items-center gap-2">
                 <h2 className="text-3xl font-black text-slate-800 tracking-tight">₹{monthlySavings}</h2>
                 <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+14%</span>
               </div>
               {/* Shimmer Effect */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
            </div>
         </div>
      </header>

      {/* 2. DYNAMIC CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* LEFT: DONUT Spend Intelligence */}
         <div className="lg:col-span-7 bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/20 p-8 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
               <div>
                 <h2 className="text-xl font-black text-slate-800 tracking-tight">Spend Allocation</h2>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time category audit</p>
               </div>
               <TrendingUp className="text-emerald-500 w-5 h-5" />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10">
               {/* Donut Container */}
               <div className="relative w-64 h-64 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={105}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        onMouseEnter={(_, index) => setActiveSegment(pieData[index].name)}
                        onMouseLeave={() => setActiveSegment(null)}
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            opacity={activeSegment ? (activeSegment === entry.name ? 1 : 0.3) : 1}
                            style={{ cursor: 'pointer', transition: 'opacity 0.3s' }}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                             return (
                               <div className="bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl text-white">
                                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{payload[0].name}</p>
                                  <p className="text-sm font-black">₹{payload[0].value}</p>
                               </div>
                             );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</p>
                     <p className="text-2xl font-black text-slate-800 tracking-tighter leading-none">₹{totalSpend}</p>
                  </div>
               </div>

               {/* Custom Legend */}
               <div className="flex-1 space-y-4 w-full">
                  {pieData.map((data, i) => (
                    <div 
                      key={i} 
                      className={`flex justify-between items-center p-3 rounded-2xl transition-all duration-300 border ${activeSegment === data.name ? 'bg-white border-slate-100 shadow-md translate-x-2' : 'border-transparent opacity-60'}`}
                      onMouseEnter={() => setActiveSegment(data.name)}
                      onMouseLeave={() => setActiveSegment(null)}
                    >
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                         <span className="text-xs font-black text-slate-700 tracking-tight truncate">{data.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900 leading-none">₹{data.value}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* RIGHT: PREDICTIVE ACTION TILES */}
         <div className="lg:col-span-5 space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Priority Actions</h2>
              <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {predictionList.map((item, idx) => {
                const Icon = CATEGORY_PALETTE.find(p => p.name === getMappedCategory(item.category))?.icon || Package;
                return (
                  <motion.div 
                    key={item._id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/60 backdrop-blur-md rounded-[24px] border border-white/20 p-5 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                  >
                     <div className="flex gap-4 items-center mb-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                           <Icon size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h3 className="font-black text-slate-800 text-sm tracking-tight truncate">{item.name}</h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.daysLeft} Days Remain</p>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white p-2 rounded-xl shadow-lg hover:bg-indigo-700">
                           <Plus size={16} />
                        </button>
                     </div>
                     {/* Progress Bar */}
                     <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className={`h-full rounded-full ${item.progress < 30 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-emerald-500'}`}
                        />
                     </div>
                  </motion.div>
                );
              })}
            </div>
         </div>

      </div>

      {/* 3. CEO INSIGHTS FOOTER */}
      <footer className="mt-12">
         <div className="bg-slate-900 rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden group">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
               <BrainCircuit size={120} />
            </div>
            
            <div className="max-w-3xl space-y-6 relative z-10">
               <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-400/30">
                     <Zap size={20} className="text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">CEO Financial Insight</h3>
               </div>
               
               <p className="text-xl md:text-2xl font-black text-slate-200 leading-tight">
                 "Strategic Optimization: You could unlock <span className="text-orange-400">₹240/month</span> by switching your <span className="text-emerald-400">Snacks</span> procurement to bulk-buying on Fridays."
               </p>
               
               <div className="flex items-center gap-4">
                  <button className="text-xs font-black bg-white text-slate-900 px-6 py-3 rounded-full hover:bg-slate-100 transition-colors shadow-xl uppercase tracking-widest">
                    Create bulk list
                  </button>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60">Verified by SmartSpend AI v2.4</p>
               </div>
            </div>
         </div>
      </footer>

      {/* Custom Styles Injection */}
      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

