"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Search, Lightbulb, TrendingDown, Clock, Crown, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface PlatformBreakdown {
  platform: string;
  price: number;
  eta: string;
}

interface PriceData {
  itemName: string;
  bestPlatform: string;
  predictedPriceDrop: number;
  bestTimeToBuy: string;
  breakdown: PlatformBreakdown[];
  aiInsight: string;
}

export default function PriceSearch() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PriceData | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios.get(`/api/prices/search-prices?query=${encodeURIComponent(query)}`);
      // Validate that the returned data matches the expected structure
      if (response.data && response.data.breakdown) {
        setData(response.data);
      } else {
        throw new Error('Invalid data format received from server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch price predictions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 font-sans">
      
      {/* 1. SEARCH ACTIONS BAR */}
      <div className="mb-10 max-w-3xl mx-auto">
        <form 
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-100 transition-all duration-300"
        >
          <div className="flex-1 flex items-center px-4 py-2 w-full">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for groceries (e.g., Milk 1L, Fortune Atta 5kg)..."
              className="w-full bg-transparent border-none outline-none text-lg text-slate-700 font-medium placeholder:text-slate-300"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              isLoading 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-200'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Compare <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* ERROR STATE */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 max-w-3xl mx-auto"
          >
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-8"
          >
            
            {/* 2. AI INSIGHTS BANNER */}
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm relative overflow-hidden">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="bg-indigo-100 p-3 rounded-xl shrink-0">
                <Lightbulb className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-1">Smart Assistant Insight</h3>
                <p className="text-indigo-800/90 leading-relaxed font-medium">
                  {data.aiInsight}
                </p>
              </div>
            </div>

            {/* 3. HIGH-LEVEL STATS TICKER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1 */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Best Strategy</p>
                  <p className="text-xl font-black text-slate-800">{data.bestPlatform}</p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Forecasted Dip</p>
                  <p className="text-xl font-black text-slate-800">
                    {data.predictedPriceDrop > 0 ? `${data.predictedPriceDrop}% Drop Expected` : 'Stable Pricing'}
                  </p>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Optimal Timing</p>
                  <p className="text-xl font-black text-slate-800">{data.bestTimeToBuy}</p>
                </div>
              </div>
            </div>

            {/* 4. COMPARATIVE GRID */}
            <div>
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Market Breakdown</h2>
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Live Audit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.breakdown.map((item, index) => {
                  const isBest = item.platform === data.bestPlatform;

                  return (
                    <motion.div
                      key={item.platform}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative bg-white rounded-2xl p-6 transition-all duration-300 flex flex-col items-center text-center ${
                        isBest 
                          ? 'border-2 border-emerald-400 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)] scale-105 z-10' 
                          : 'border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
                      }`}
                    >
                      {/* CRITICAL LOGIC: Pill Badge for Cheapest */}
                      {isBest && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1.5 whitespace-nowrap">
                          <Crown className="w-3 h-3" /> Cheapest Choice
                        </div>
                      )}

                      <h3 className="text-lg font-black text-slate-700 mt-2">{item.platform}</h3>
                      
                      <div className="my-5 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Price</p>
                        <p className={`text-4xl font-black tracking-tighter ${isBest ? 'text-emerald-600' : 'text-slate-900'}`}>
                          <span className="text-2xl text-slate-300 mr-1">₹</span>
                          {item.price}
                        </p>
                      </div>

                      <div className="w-full mt-auto pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {item.eta}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
