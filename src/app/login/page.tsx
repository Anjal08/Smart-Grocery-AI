"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Search, Lock, Mail, ChevronRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Placeholder for Credentials login logic
    console.log("Login with:", email, password);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#F1F5F9] overflow-hidden"
      >
        <div className="p-8 md:p-12 space-y-8">
           {/* Logo Section */}
           <div className="text-center space-y-2">
             <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="text-amber-600 w-6 h-6" />
             </div>
             <h1 className="text-2xl font-black text-[#1E293B] tracking-tight">Welcome Back.</h1>
             <p className="text-sm font-medium text-[#64748B]">Sign in to manage your SmartPantry portfolio.</p>
           </div>

           {/* Form Section */}
           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-100 transition-all text-sm font-bold placeholder:text-slate-300"
                      placeholder="executive@smartgrocery.ai"
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-100 transition-all text-sm font-bold placeholder:text-slate-300"
                      placeholder="••••••••"
                    />
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                {isLoading ? "Signing in..." : "Continue"}
                {!isLoading && <ChevronRight className="w-4 h-4" />}
              </button>
           </form>

           <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative px-3 bg-white text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
           </div>

           {/* Social Login */}
           <button 
             onClick={() => signIn("google", { callbackUrl: "/" })}
             className="w-full bg-white border border-slate-100 py-4 rounded-xl font-black text-sm text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm group"
           >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" />
              Continue with Google
           </button>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
             <Sparkles className="w-3 h-3 text-amber-500" />
             AI-Powered SmartGrocery Engine
           </p>
        </div>
      </motion.div>
    </div>
  );
}
