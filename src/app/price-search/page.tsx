"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Search, ExternalLink, Loader2, Crown, TrendingDown, ShoppingBag, Zap, ArrowRight, CheckCircle2, XCircle, Clock, Sparkles, Plus, MapPin, AlertCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { mutate } from 'swr';
import { ComparisonCard } from '@/components/ComparisonCard';
import ProductCard from '@/components/ProductCard';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlatformResult {
  platform: string;
  productName: string;
  price: number;
  mrp: number;
  discount: number;
  platformFee: number;
  totalPrice: number;
  available: boolean;
  productImage: string;
  emoji: string;
  section: string;
  deepLink: string;
  color: string;
  isBestValue: boolean;
  deliveryTime: string;
}

interface CompareResponse {
  success: boolean;
  query: string;
  results: PlatformResult[];
  cheapest: string | null;
  mostExpensive: string | null;
  savings: number;
  asOf: string;
  error?: string;
}

// ─── Platform Config ─────────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<string, { color: string; gradient: string; bg: string; border: string; icon: string; logo: string; tagline: string }> = {
  'Blinkit': {
    color: '#F8CB46',
    gradient: 'from-yellow-400 to-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '⚡',
    logo: '/blinkit-logo.png',
    tagline: '10 min delivery',
  },
  'Zepto': {
    color: '#7B2D8E',
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: '🚀',
    logo: '/zepto-logo.png',
    tagline: '10 min delivery',
  },
  'BigBasket': {
    color: '#84C225',
    gradient: 'from-lime-400 to-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '🧺',
    logo: '/bigbasket-logo.png',
    tagline: 'Wide selection',
  },
  'Flipkart Minutes': {
    color: '#2874F0',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: '🛒',
    logo: '/flipkart-logo.png',
    tagline: 'Minutes delivery',
  },
};

const POPULAR_ITEMS = ['Paneer', 'Atta 5kg', 'Milk 1L', 'Bread', 'Eggs 12pc', 'Coconut', 'Pomegranate', 'Butter 500g', 'Rice 5kg', 'Curd 400g'];

// ─── Platform Status Tracker ─────────────────────────────────────────────────

type PlatformStatus = 'idle' | 'loading' | 'done' | 'failed';

interface StatusState {
  Blinkit: PlatformStatus;
  Zepto: PlatformStatus;
  BigBasket: PlatformStatus;
  'Flipkart Minutes': PlatformStatus;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PriceSearchPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addingPlatform, setAddingPlatform] = useState<string | null>(null);
  const [platformStatus, setPlatformStatus] = useState<StatusState>({
    Blinkit: 'idle',
    Zepto: 'idle',
    BigBasket: 'idle',
    'Flipkart Minutes': 'idle',
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [currentPincode, setCurrentPincode] = useState('226001');
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/history?limit=10');
      const data = await res.json();
      if (data.history) setHistory(data.history);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, []);

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`http://localhost:8000/get-pincode?lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data.pincode) {
          setCurrentPincode(data.pincode);
        }
      } catch (err) {
        console.error("Location detection failed:", err);
      } finally {
        setIsDetectingLocation(false);
      }
    }, (err) => {
      console.error("Could not detect location:", err);
      setIsDetectingLocation(false);
    });
  }, []);

  useEffect(() => {
    // Automatically request location when the page opens
    detectLocation();
    fetchHistory();
  }, [detectLocation, fetchHistory]);

  const handleSearch = useCallback(async (query?: string) => {
    const q = (query || searchQuery).trim();
    if (!q) return;
    if (query) setSearchQuery(query);

    setIsLoading(true);
    setCompareData(null);
    setSearchError(null);

    // Animate platform statuses
    setPlatformStatus({
      Blinkit: 'loading',
      Zepto: 'loading',
      BigBasket: 'loading',
      'Flipkart Minutes': 'loading',
    });

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: q, pincode: currentPincode }),
      });

      const data: CompareResponse = await response.json();

      if (!data.success) {
        setSearchError(data.error || 'The pricing engine encountered an error. Please try again.');
        setPlatformStatus({
          Blinkit: 'failed',
          Zepto: 'failed',
          BigBasket: 'failed',
          'Flipkart Minutes': 'failed',
        });
        return;
      }

      if (data.results) {
        // Update statuses based on results
        const newStatus: StatusState = {
          Blinkit: 'failed',
          Zepto: 'failed',
          BigBasket: 'failed',
          'Flipkart Minutes': 'failed',
        };
        data.results.forEach(r => {
          if (r.platform in newStatus) {
            (newStatus as any)[r.platform] = r.available ? 'done' : 'failed';
          }
        });
        setPlatformStatus(newStatus);
        setCompareData(data);
        fetchHistory(); // Refresh history after search
      }
    } catch (error) {
      console.error('Compare search failed:', error);
      setPlatformStatus({
        Blinkit: 'failed',
        Zepto: 'failed',
        BigBasket: 'failed',
        'Flipkart Minutes': 'failed',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentPincode, fetchHistory]);

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent search when clicking delete
    try {
      const res = await fetch(`http://localhost:8000/history/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const handleAddToInventory = async (result: PlatformResult) => {
    setAddingPlatform(result.platform);
    try {
      const res = await fetch('/api/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.productName,
          price: result.totalPrice,
        }),
      });
      if (res.ok) {
        mutate('/api/pantry');
        mutate('/api/stats/spending');
        setTimeout(() => setAddingPlatform(null), 1500);
      }
    } catch (err) {
      console.error(err);
      setAddingPlatform(null);
    }
  };

  const getStatusIcon = (status: PlatformStatus) => {
    switch (status) {
      case 'loading': return <Loader2 className="w-3.5 h-3.5 animate-spin" />;
      case 'done': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'failed': return <XCircle className="w-3.5 h-3.5 text-red-400" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-300" />;
    }
  };

  const availableResults = compareData?.results?.filter(r => r.available) || [];
  const unavailableResults = compareData?.results?.filter(r => !r.available) || [];

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 pt-20 pb-20 px-6 font-sans selection:bg-indigo-100">
      
      {/* ─── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="flex-1 space-y-10">

      {/* ─── HERO SECTION ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-5"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-2 rounded-full border border-indigo-100">
          <Zap className="w-4 h-4 text-indigo-600" />
          <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">Multi-Platform Intelligence</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1]">
          Compare Prices<br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Across Q-Commerce</span>
        </h1>

        <p className="text-slate-400 font-semibold text-sm max-w-xl mx-auto leading-relaxed">
          Real-time price auditing across Blinkit, Zepto, BigBasket & Flipkart Minutes.<br />
          Find the cheapest deal in seconds.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-4 mt-8 max-w-4xl mx-auto">
          <div className="flex-1 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-100 rounded-[32px] flex items-center p-2.5 focus-within:ring-4 focus-within:ring-indigo-100/60 transition-all duration-500 w-full">
            <div className="pl-5 pr-2"><Search className="w-5 h-5 text-slate-400" /></div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search any grocery item..."
              className="flex-1 bg-transparent border-none px-4 py-4 text-lg outline-none font-bold text-slate-700 placeholder:text-slate-300"
            />
          </div>

          <div className="flex items-center bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-100 rounded-[24px] px-4 py-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-100 group">
            <button
              onClick={detectLocation}
              disabled={isDetectingLocation}
              title="Detect my location"
              className={`p-2 rounded-xl transition-all ${
                isDetectingLocation ? 'bg-slate-50 text-slate-300' : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {isDetectingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            </button>
            <div className="flex flex-col ml-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Pincode</span>
              <input 
                type="text"
                value={currentPincode}
                onChange={(e) => setCurrentPincode(e.target.value)}
                className="bg-transparent border-none px-2 py-0 text-sm font-black text-slate-700 outline-none w-20"
              />
            </div>
          </div>

          <div className="bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-100 rounded-[28px] p-2.5 flex items-center gap-2 w-full md:w-auto">
            <select 
              className="bg-transparent border-none px-6 py-4 text-sm font-black text-slate-600 outline-none cursor-pointer"
              onChange={(e) => {
                const qty = e.target.value;
                if (qty && searchQuery) {
                  // Append/Replace quantity in search
                  const base = searchQuery.replace(/\s*(\d+)\s*(g|kg|ml|l).*/i, '').trim();
                  handleSearch(`${base} ${qty}`);
                }
              }}
            >
              <option value="">Quantity</option>
              <option value="500g">500g</option>
              <option value="1kg">1kg</option>
              <option value="2kg">2kg</option>
              <option value="5kg">5kg</option>
              <option value="1L">1L</option>
              <option value="500ml">500ml</option>
            </select>
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !searchQuery.trim()}
            className="px-10 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[24px] font-black hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] w-full md:w-auto justify-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Compare</span>
          </button>
        </div>

        {/* ─── POPULAR ITEMS CHIPS ────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto pt-2">
          {POPULAR_ITEMS.map(item => (
            <button
              key={item}
              onClick={() => handleSearch(item)}
              disabled={isLoading}
              className="px-4 py-2 rounded-full bg-white border border-slate-100 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-300 shadow-sm disabled:opacity-50 active:scale-95"
            >
              {item}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── PLATFORM STATUS TRACKER ─────────────────────────────── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[28px] border border-slate-100 shadow-lg shadow-slate-100/50 p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                Scanning Platforms • Lucknow (226001)
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(PLATFORM_CONFIG).map(([platform, config]) => (
                <div
                  key={platform}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-500 ${
                    platformStatus[platform as keyof StatusState] === 'loading'
                      ? `${config.bg} ${config.border} shadow-sm`
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  {getStatusIcon(platformStatus[platform as keyof StatusState])}
                  <div className="w-6 h-6 flex-shrink-0">
                    <img src={config.logo} alt={platform} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{platform}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LOADING STATE ────────────────────────────────────────── */}
      <AnimatePresence>
        {isLoading && !compareData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 space-y-5"
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Sparkles className="w-7 h-7 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Scanning 4 Platforms</p>
              <p className="text-xs text-slate-400 mt-1">This may take 15-30 seconds...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SAVINGS BANNER ───────────────────────────────────────── */}
      <AnimatePresence>
        {compareData && compareData.savings > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-200/40"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-[20px] flex items-center justify-center">
                  <TrendingDown className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Best Deal Found</p>
                  <p className="text-3xl font-black mt-1">
                    Save ₹{compareData.savings}
                  </p>
                  <p className="text-sm font-semibold text-white/80 mt-1">
                    by choosing <span className="font-black underline decoration-2 underline-offset-4">{compareData.cheapest}</span> over {compareData.mostExpensive}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
                <Crown className="w-5 h-5" />
                <span className="text-sm font-black">{compareData.cheapest} Wins!</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── UNIFIED COMPARISON VIEW ────────────────────────────── */}
      <AnimatePresence>
        {compareData && availableResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-8"
          >
            {/* 1. HERO BEST MATCH CARD */}
            {(() => {
              const bestMatch = availableResults.find(r => r.isBestValue) || availableResults[0];
              const config = PLATFORM_CONFIG[bestMatch.platform] || PLATFORM_CONFIG['Blinkit'];
              return (
                <div className="relative overflow-hidden bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-100/50 p-10 group">
                  <div className="absolute top-0 right-0 p-8">
                    <div className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 animate-bounce">
                      <Crown className="w-4 h-4" />
                      Global Best Match
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    <ProductCard 
                      name={bestMatch.productName} 
                      imageUrl={bestMatch.productImage} 
                      emoji={bestMatch.emoji} 
                      size="large"
                    />
                    
                    <div className="flex-1 space-y-6 text-center md:text-left">
                      <div>
                        <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-2 justify-center md:justify-start">
                          <Sparkles className="w-3 h-3" /> Recommended Choice
                        </p>
                        <h2 className="text-3xl font-black text-slate-900 leading-tight">
                          {bestMatch.productName}
                        </h2>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lowest Price</p>
                          <p className="text-5xl font-black text-slate-900">₹{bestMatch.price}</p>
                        </div>
                        <div className="w-px h-12 bg-slate-100 hidden md:block" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store</p>
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            <img src={config.logo} alt={bestMatch.platform} className="h-6 object-contain" />
                            <span className="text-lg font-black text-slate-700">{bestMatch.platform}</span>
                          </div>
                        </div>
                        <div className="w-px h-12 bg-slate-100 hidden md:block" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery</p>
                          <div className="flex items-center gap-2 text-indigo-600">
                            <Zap className="w-4 h-4 fill-current" />
                            <span className="text-lg font-black">{bestMatch.deliveryTime}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 pt-2">
                        <button
                          onClick={() => handleAddToInventory(bestMatch)}
                          className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add to Pantry
                        </button>
                        <button
                          onClick={() => window.open(bestMatch.deepLink, '_blank')}
                          className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95 flex items-center gap-2"
                        >
                          Verify on {bestMatch.platform} <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2. MARKET COMPARISON (BENTO ROWS) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Market Comparison</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                    Direct price audit for &ldquo;{compareData.query}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync Active
                </div>
              </div>

              <div className="space-y-4">
                {compareData.results.map((result) => {
                  const config = PLATFORM_CONFIG[result.platform] || PLATFORM_CONFIG['Blinkit'];
                  return (
                    <ComparisonCard
                      key={result.platform}
                      platform={result.platform}
                      price={result.price}
                      available={result.available}
                      deliveryTime={result.deliveryTime}
                      isBestValue={result.isBestValue}
                      deepLink={result.deepLink}
                      icon={config.logo}
                      color={config.color}
                      lastScraped="Just Now"
                      emoji={result.emoji}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── EMPTY STATE ──────────────────────────────────────────── */}
      {!isLoading && !compareData && !searchError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-[40px] border border-slate-100 shadow-lg shadow-slate-100/30 overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 px-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[32px] flex items-center justify-center border border-indigo-100/50 shadow-inner">
                <ShoppingBag className="w-10 h-10 text-indigo-300" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200/50 rotate-12">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xl font-black text-slate-800">Search to Compare Prices</p>
              <p className="text-sm text-slate-400 font-semibold mt-2 max-w-md mx-auto">
                Enter any grocery item above to see real-time prices from Blinkit, Zepto, BigBasket & Flipkart Minutes
              </p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              {Object.entries(PLATFORM_CONFIG).map(([name, config]) => (
                <div
                  key={name}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400"
                >
                  <span>{config.icon}</span>
                  <span>{name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── ERROR STATE ────────────────────────────────────────── */}
      {searchError && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="mt-12 p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-4"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-red-900 font-bold text-lg">Search Error</h3>
          <p className="text-red-600 font-medium max-w-md mx-auto">{searchError}</p>
          <button 
            onClick={() => handleSearch()}
            className="text-red-500 font-black text-xs uppercase tracking-widest hover:underline"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* ─── NO RESULTS STATE ─────────────────────────────────────── */}
      {compareData && availableResults.length === 0 && !isLoading && !searchError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-[40px] border border-slate-100 shadow-lg p-12 text-center"
        >
          <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mx-auto mb-5 border border-red-100">
            <XCircle className="w-8 h-8 text-red-300" />
          </div>
          <p className="text-xl font-black text-slate-800">No Results Found</p>
          <p className="text-sm text-slate-400 font-semibold mt-2">
            &ldquo;{compareData.query}&rdquo; wasn&apos;t found on any platform. Try a different search term.
          </p>
        </motion.div>
      )}

      </div>

      {/* ─── RECENT HISTORY SIDEBAR ────────────────────────────────── */}
      <div className="w-full lg:w-[350px] space-y-6">
        <div className="sticky top-24 bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent History</h3>
            </div>
            <span className="text-[9px] font-black text-slate-300 uppercase bg-slate-50 px-2 py-1 rounded-md">Live</span>
          </div>

          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item, idx) => (
                <motion.div
                  key={item._id || idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="w-full group relative flex items-center gap-4 p-3 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 transition-all duration-300 text-left cursor-pointer"
                  onClick={() => handleSearch(item.query)}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {item.top_result?.emoji || "🔍"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {item.query}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                      {item.result_count} stores found
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteHistory(item._id, e)}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                      title="Delete search history"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Package className="w-5 h-5 text-slate-200" />
                </div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No recent data</p>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-50">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">Audit Tip</p>
                <p className="text-xs font-bold leading-relaxed">
                  Click any past search to re-audit prices instantly. SmartMatch refreshes in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── FOOTER ───────────────────────────────────────────────── */}
      <div className="text-center opacity-30 pt-4">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
          Multi-Platform Price Audit • SmartGrocery AI Protocol • 2026
        </p>
      </div>
    </div>
  );
}