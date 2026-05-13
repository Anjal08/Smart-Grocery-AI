"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Loader2,
  Leaf,
  Droplets,
  Wheat,
  CandyOff,
  Heart,
  ChevronRight,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HealthFlag {
  type: "warning" | "danger" | "info";
  message: string;
}

interface ScanResult {
  ecoHealthScore: number;
  hiddenSugars: string[];
  harmfulAdditives: string[];
  healthFlags: HealthFlag[];
  dietaryCompatibility: {
    isVegan: boolean;
    isGlutenFree: boolean;
    isLowSugar: boolean;
    isNutFree: boolean;
  };
  recommendation: string;
  analyzedProduct: string;
}

export default function HealthScannerPage() {
  const [productName, setProductName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async () => {
    if (!productName && !ingredients) return;
    setIsScanning(true);
    setResult(null);

    try {
      const res = await fetch("/api/health/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, ingredients }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-200", label: "Excellent" };
    if (score >= 60) return { bg: "bg-amber-500", text: "text-amber-600", ring: "ring-amber-200", label: "Moderate" };
    if (score >= 40) return { bg: "bg-orange-500", text: "text-orange-600", ring: "ring-orange-200", label: "Caution" };
    return { bg: "bg-rose-500", text: "text-rose-600", ring: "ring-rose-200", label: "Poor" };
  };

  const getFlagIcon = (type: string) => {
    if (type === "danger") return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    if (type === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <ShieldCheck className="w-4 h-4 text-blue-500" />;
  };

  const getFlagBg = (type: string) => {
    if (type === "danger") return "bg-rose-50 border-rose-100";
    if (type === "warning") return "bg-amber-50 border-amber-100";
    return "bg-blue-50 border-blue-100";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-32">
      {/* Header */}
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100"
        >
          <ShieldCheck className="w-3 h-3" />
          AI-Powered Ingredient Analysis
        </motion.div>
        <h1 className="text-4xl font-extrabold text-[#1E293B] tracking-tight">
          Health <span className="text-emerald-500">Scanner</span>
        </h1>
        <p className="text-[#64748B] font-medium max-w-xl">
          Scan any product&apos;s ingredients to detect hidden sugars, harmful additives, and get a personalized Eco-Health Score.
        </p>
      </div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-[32px] p-8 shadow-xl space-y-6"
      >
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Product Name</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Maggi 2-Minute Noodles, Parle-G Biscuits..."
              className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-[#1E293B] font-bold placeholder-slate-300 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Ingredients (Optional)</label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Paste the ingredients list from the packaging..."
            rows={4}
            className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-4 text-[#1E293B] font-medium placeholder-slate-300 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
          />
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning || (!productName && !ingredients)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing with Gemini AI...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Scan for Health Insights
            </>
          )}
        </button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="space-y-8"
          >
            {/* Eco-Health Score + Product Header */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-[32px] p-8 shadow-xl flex flex-col md:flex-row items-center gap-8">
              {/* Circular Score Gauge */}
              <div className="relative w-40 h-40 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <motion.circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={result.ecoHealthScore >= 80 ? "#10b981" : result.ecoHealthScore >= 60 ? "#f59e0b" : result.ecoHealthScore >= 40 ? "#f97316" : "#ef4444"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - result.ecoHealthScore / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-black ${getScoreColor(result.ecoHealthScore).text}`}>
                    {result.ecoHealthScore}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {getScoreColor(result.ecoHealthScore).label}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 text-center md:text-left">
                <h2 className="text-2xl font-black text-[#1E293B]">{result.analyzedProduct}</h2>
                <p className="text-sm font-medium text-[#64748B] leading-relaxed">{result.recommendation}</p>

                {/* Dietary Badges */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {[
                    { key: "isVegan", label: "Vegan", icon: <Leaf className="w-3 h-3" /> },
                    { key: "isGlutenFree", label: "Gluten-Free", icon: <Wheat className="w-3 h-3" /> },
                    { key: "isLowSugar", label: "Low Sugar", icon: <CandyOff className="w-3 h-3" /> },
                    { key: "isNutFree", label: "Nut-Free", icon: <Heart className="w-3 h-3" /> },
                  ].map((badge) => {
                    const isCompatible = result.dietaryCompatibility[badge.key as keyof typeof result.dietaryCompatibility];
                    return (
                      <span
                        key={badge.key}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isCompatible
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-rose-50 text-rose-500 border-rose-100"
                        }`}
                      >
                        {badge.icon}
                        {badge.label} {isCompatible ? "✓" : "✗"}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hidden Sugars & Harmful Additives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hidden Sugars */}
              <div className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-[32px] p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Hidden Sugars</span>
                </div>
                {result.hiddenSugars.length > 0 ? (
                  <div className="space-y-2">
                    {result.hiddenSugars.map((sugar, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                        <ChevronRight className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="text-sm font-bold text-[#1E293B]">{sugar}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">No hidden sugars found!</p>
                  </div>
                )}
              </div>

              {/* Harmful Additives */}
              <div className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-[32px] p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Harmful Additives</span>
                </div>
                {result.harmfulAdditives.length > 0 ? (
                  <div className="space-y-2">
                    {result.harmfulAdditives.map((additive, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-rose-50/50 rounded-xl border border-rose-100/50">
                        <ChevronRight className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="text-sm font-bold text-[#1E293B]">{additive}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">No harmful additives detected!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Health Flags */}
            {result.healthFlags.length > 0 && (
              <div className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-[32px] p-6 shadow-xl space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Detailed Flags</span>
                <div className="space-y-2">
                  {result.healthFlags.map((flag, i) => (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${getFlagBg(flag.type)}`}>
                      {getFlagIcon(flag.type)}
                      <span className="text-sm font-semibold text-[#1E293B]">{flag.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
