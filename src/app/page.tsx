"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Camera, Mic, ShoppingCart, AlertTriangle, 
  Wallet, BrainCircuit, Package, ChevronRight, 
  Sparkles, Clock, CheckCircle2, MicOff,
  Carrot, Cookie, Milk, Wheat, Zap,
  TrendingDown, Plus
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import useSWR, { mutate } from 'swr';
import { useSession } from "next-auth/react";
import UserDropdown from '@/components/UserDropdown';
import ProductThumbnail from '@/components/ProductThumbnail';

// Fetcher helper
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // SWR DATA HOOKS
  const { data: items = [], isLoading: isInventoryLoading } = useSWR('/api/pantry', fetcher);
  const { data: aiTipData, mutate: mutateTip } = useSWR('/api/ai/generate-tips', fetcher);
  const { data: marketAlertData } = useSWR('/api/market/alert', fetcher);
  const { data: spendingData, mutate: mutateSpending } = useSWR('/api/stats/spending', fetcher);

  // Fallback mock data if DB is empty
  const pricePulseData = useMemo(() => [
    { day: 'M', price: 0 }, { day: 'T', price: 0 }, { day: 'W', price: 0 },
    { day: 'T', price: 0 }, { day: 'F', price: 0 }, { day: 'S', price: 0 }, { day: 'S', price: 0 },
  ], []);

  const aiTip = aiTipData?.tip || "Analyzing your pantry health...";
  const marketAlert = marketAlertData?.alert || "Analyzing market prices...";
  const spendingChartData = spendingData?.chartData || pricePulseData;

  const handleSearchSubmit = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsAdding(true);
      try {
        // 1. SCRAPE (Location Aware)
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productName: searchQuery.trim(), pincode: '226001' }),
        });
        const scrapeData = await scrapeRes.json();

        // 2. ADD TO INVENTORY
        const invRes = await fetch("/api/inventory/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: searchQuery.trim(), 
            price: scrapeData.totalPrice || 120 
          }),
        });

        // 3. LOG TRANSACTION
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            itemName: searchQuery.trim(), 
            category: "Smart Add", 
            price: scrapeData.totalPrice || 120,
            source: "Flipkart Minutes"
          }),
        });

        if (invRes.ok) {
          setSearchQuery("");
          // INSTANT REFRESH
          mutate('/api/pantry');
          mutateSpending();
          mutateTip();
        }
      } catch (err) {
        console.error("Failed to add item via search:", err);
      } finally {
        setIsAdding(false);
      }
    }
  };
  
  // Custom Voice Hook
  const { transcript, isListening, isError, toggleListening, setTranscript } = useSpeechToText();

  // Sync transcript to searchQuery
  useEffect(() => {
    if (transcript) setSearchQuery(transcript);
  }, [transcript]);

  const isLoading = isInventoryLoading;

  // --- Computed Metrics ---
  const totalItemsCount = items.length;
  const recentSavings = 84; // Mocked for UI requirement
  const alertsCount = items.filter((i: any) => {
    const msPassed = new Date().getTime() - new Date(i.purchaseDate).getTime();
    const daysPassed = Math.max(0, Math.floor(msPassed / (1000 * 60 * 60 * 24)));
    const shelfLife = i.category?.includes("Dairy") ? 5 : 7;
    return (shelfLife - daysPassed) <= 2;
  }).length;
  
  const thisMonthSpend = items.reduce((acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 1), 0);

  // Freshness Engine
  const expiringItems = useMemo(() => {
    return items
      .filter((i: any) => i.category === "Fresh Produce" || i.category === "Vegetables & Fruits" || i.category === "Dairy & Bakery")
      .map((item: any) => {
        const msPassed = new Date().getTime() - new Date(item.purchaseDate).getTime();
        const daysPassed = Math.max(0, Math.floor(msPassed / (1000 * 60 * 60 * 24)));
        const shelfLife = item.category?.includes("Dairy") ? 5 : 7;
        const daysLeft = shelfLife - daysPassed;

        let semanticLabel = "FRESH";
        let statusColor = "bg-emerald-50 text-emerald-700";

        if (daysLeft <= 0) {
          semanticLabel = "CHECK QUALITY";
          statusColor = "bg-rose-50 text-rose-700";
        } else if (daysLeft <= 2) {
          semanticLabel = "NEARLY BAD";
          statusColor = "bg-rose-100 text-rose-800";
        } else if (daysLeft <= 4) {
          semanticLabel = "USE SOON";
          statusColor = "bg-amber-100 text-amber-800";
        }

        return { ...item, semanticLabel, statusColor, daysLeft };
      })
      .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
      .slice(0, 6);
  }, [items]);

  const itemsByCategory = useMemo(() => {
    return expiringItems.reduce((acc: any, item: any) => {
      let cat = item.category;
      if (["Vegetables & Fruits", "Fresh Produce"].includes(cat)) cat = "VEGETABLES & FRUITS";
      if (cat?.includes("Dairy")) cat = "DAIRY & BAKERY";
      
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, typeof expiringItems>);
  }, [expiringItems]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 relative overflow-x-hidden">
      
      {/* 1. TOP HERO SECTION (Sticky Gradient Header) */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-[#EEF2FF] to-white/90 backdrop-blur-md pt-6 pb-4 px-6 md:px-12 transition-all">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
             <div>
               <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                  Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {session?.user?.name?.split(' ')[0] || 'Executive'}.
               </h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Your SmartPantry Portfolio is healthy</p>
             </div>
             <UserDropdown />
          </div>

          {/* Pop-out Search Bar */}
          <div className="relative group">
            <div className={`flex items-center bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-focus-within:shadow-xl transition-all duration-300 ring-2 ring-transparent group-focus-within:ring-indigo-100`}>
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
              <input 
                type="text" 
                placeholder={isAdding ? "Syncing location price..." : isListening ? "Listening..." : "Trade or add grocery assets..."} 
                disabled={isAdding}
                value={searchQuery}
                onKeyDown={handleSearchSubmit}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder-slate-400 font-bold text-slate-700 disabled:opacity-50"
              />
              <div className="flex items-center gap-4 border-l border-slate-100 pl-4">
                <button 
                  onClick={() => document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent('click'))}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Scan Receipt"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <div className="relative group/tool">
                  <button 
                    onClick={toggleListening}
                    disabled={isError && !isListening}
                    title={isError ? "Voice currently unavailable - please type" : (isListening ? "Stop listening" : "Voice Input")}
                    className={`transition-all duration-300 ${isError ? 'opacity-40 cursor-not-allowed' : ''} ${isListening ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-indigo-600'}`}
                  >
                    {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  {isError && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                      Voice currently unavailable — please type
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Smart Stats Row */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {[
              { label: 'Items', val: totalItemsCount, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Savings', val: `₹${recentSavings}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Alerts', val: alertsCount, icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${stat.bg}`}>
                  <stat.icon size={12} className={stat.color} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-slate-800">{stat.val}</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-12 mt-4 space-y-8">
        
        {/* 2. CATEGORY QUICK-LINKS */}
        <section className="space-y-3">
           <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Categories</h2>
           <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
             {[
               { name: 'Veggies', icon: Carrot, color: 'text-emerald-500', bg: 'bg-emerald-50' },
               { name: 'Dairy', icon: Milk, color: 'text-blue-500', bg: 'bg-blue-50' },
               { name: 'Snacks', icon: Cookie, color: 'text-amber-500', bg: 'bg-amber-50' },
               { name: 'Staples', icon: Wheat, color: 'text-purple-500', bg: 'bg-purple-50' },
               { name: 'Drinks', icon: ShoppingCart, color: 'text-indigo-500', bg: 'bg-indigo-50' },
             ].map((cat, i) => (
                <button key={i} className="flex flex-col items-center gap-2 group shrink-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.bg} group-hover:scale-105 transition-transform duration-200 border-2 border-white shadow-md`}>
                    <cat.icon size={24} className={cat.color} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600">{cat.name}</span>
                </button>
             ))}
           </div>
        </section>

        {/* 3. BENTO ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* CRITICAL: Items to Use Now */}
          <div className="bg-[#FFF1F2] rounded-[24px] p-6 border border-rose-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
             <div className="flex justify-between items-start mb-6">
               <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                 <Clock className="w-5 h-5 text-rose-500" />
               </div>
               <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Urgent</span>
             </div>
             <h3 className="text-sm font-black text-rose-900 mb-1">Items to Use Now</h3>
             <p className="text-[11px] font-medium text-rose-600/80 mb-4 tracking-tight">AI predicts these will finish peak freshness in 48h.</p>
             <div className="space-y-2">
                {expiringItems.slice(0, 2).map(item => (
                  <div key={item._id} className="flex items-center gap-2 bg-white/50 p-2 rounded-xl text-xs font-bold text-rose-900 border border-rose-100/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {item.name}
                  </div>
                ))}
             </div>
          </div>

          {/* INSIGHT: AI Suggestions */}
          <div className="bg-[#FAF5FF] rounded-[24px] p-6 border border-purple-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
             <div className="flex justify-between items-start mb-6">
               <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                 <Sparkles className="w-5 h-5 text-purple-600" />
               </div>
               <Plus className="w-4 h-4 text-purple-300" />
             </div>
              <h3 className="text-sm font-black text-purple-900 mb-1">AI Insights</h3>
              <p className="text-[11px] font-medium text-purple-600/80 mb-4 tracking-tight">Optimizing your pantry health.</p>
              <div className="space-y-3">
                 <div className="flex items-start gap-2">
                   <Zap size={14} className="text-purple-400 mt-0.5 shrink-0" />
                   <span className="text-[11px] font-bold text-purple-800 leading-tight">
                      {aiTip}
                   </span>
                 </div>
              </div>
           </div>

          {/* FINANCE: Weekly Spend */}
          <div className="bg-[#F0FDF4] rounded-[24px] p-6 border border-emerald-100 shadow-sm flex flex-col justify-between">
             <div>
               <div className="flex justify-between items-center mb-4">
                 <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                 </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-emerald-600 tracking-tighter uppercase">Weekly Spend</p>
                     <p className="text-lg font-black text-emerald-900 leading-none">₹{spendingData?.totalSpend || 0}</p>
                  </div>
               </div>
               <div className="h-20 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingChartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                      <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
             </div>
             <p className="text-[10px] font-black text-emerald-700 mt-2 flex flex-col gap-0.5 uppercase">
               <span>{marketAlert} <Zap size={10} className="inline ml-1" /></span>
               <span className="text-[8px] opacity-60">Prices as of {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
             </p>
          </div>

        </div>

        {/* 4. PRODUCT STATUS (High Density Pantry) */}
        <section className="space-y-4">
           <div className="flex justify-between items-center px-1">
             <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Pantry Status</h2>
             <button className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline">
               VIEW ALL <ChevronRight size={12} />
             </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(itemsByCategory).map(([cat, catsItems]) => (
                <div key={cat} className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm space-y-4 overflow-hidden relative">
                   {/* Background label */}
                   <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none transform translate-x-4">
                      <h3 className="text-4xl font-black">{cat.split(' ')[0]}</h3>
                   </div>

                   <h3 className="text-[10px] font-black text-slate-400 tracking-widest">{cat}</h3>
                   <div className="space-y-4">
                     {catsItems.map(item => (
                       <div key={item._id} className="flex justify-between items-center group cursor-pointer">
                         <div className="flex items-center gap-3">
                           <ProductThumbnail category={item.category} imageUrl={item.imageUrl} name={item.name} />
                           <div>
                             <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-none mb-1">{item.name}</h4>
                             <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Last restock: 4d ago</p>
                           </div>
                         </div>
                         <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tight border ${item.statusColor} border-current/10 border-indigo-100/10`}>
                           {item.semanticLabel}
                         </span>
                       </div>
                     ))}
                   </div>
                </div>
              ))}

              {/* Mocking for visual consistency if empty */}
              {!Object.keys(itemsByCategory).length && (
                <div className="bg-white rounded-[24px] h-32 flex flex-col items-center justify-center border border-dashed border-slate-200">
                   <Package className="text-slate-200 mb-2" size={32} />
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No items tracked yet</p>
                </div>
              )}
           </div>
        </section>

      </main>

      {/* 5. FLOATING ACTION BUTTON (Scan Receipt) */}
      <div className="fixed bottom-8 right-8 z-[60]">
         <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent('click'))}
           className="bg-indigo-600 text-white flex items-center gap-3 px-6 py-4 rounded-full shadow-[0_12px_40px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_50px_rgba(79,70,229,0.5)] transition-all duration-300 group"
         >
           <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors shadow-sm">
             <Camera className="w-5 h-5" />
           </div>
           <span className="font-black text-xs uppercase tracking-widest">Scan Receipt</span>
         </motion.button>
      </div>

    </div>
  );
}

