"use client";

import React, { useState, useEffect } from "react";
import { CopyPlus, Clock, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import CategoryList from "@/components/CategoryList";
import SmartNudge from "@/components/SmartNudge";

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pantry");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    // Listen to custom event fired by Sidebar upon receipt upload
    const handleUpdate = () => {
      fetchInventory();
    };
    window.addEventListener("inventory-updated", handleUpdate);
    return () => window.removeEventListener("inventory-updated", handleUpdate);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-100">
            <Sparkles className="w-3 h-3" />
            AI-Categorized
          </div>
          <h1 className="text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Smart <span className="text-amber-500">Pantry</span>
          </h1>
          <p className="text-[#64748B] font-medium max-w-lg">
            Your dynamic inventory mapped into smart categories. Freshness and stock levels are estimated automatically.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-50 space-y-4">
           <StatusLoading />
        </div>
      ) : (
        <div className="relative pt-6">
           {/* Floating Pulsing AI Banner */}
           <motion.div 
             initial={{ y: -20, opacity: 0 }}
             animate={{ 
               y: 0, 
               opacity: 1,
               scale: [1, 1.01, 1]
             }}
             transition={{
               y: { duration: 0.5 },
               opacity: { duration: 0.5 },
               scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
             }}
             className="absolute top-0 inset-x-0 z-20 flex justify-center -translate-y-1/2 pointer-events-none"
           >
              <div className="bg-white/80 backdrop-blur-md border border-amber-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-5 py-2.5 rounded-full flex items-center gap-3 pointer-events-auto">
                 <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                 </div>
                 <span className="text-[11px] font-bold text-amber-900 tracking-tight">AI Suggestion: Spinach and Milk are nearly bad. Make a smoothie today!</span>
                 <button className="text-[10px] uppercase font-black text-amber-500 hover:text-amber-600 transition-colors tracking-widest pl-2">Details</button>
              </div>
           </motion.div>

           <CategoryList items={items} onRefill={fetchInventory} />
        </div>
      )}
    </div>
  );
}

function StatusLoading() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Digital Pantry...</p>
    </div>
  )
}
