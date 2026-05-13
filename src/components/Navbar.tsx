import React from 'react';
import { Sparkles, Camera, Mic, Search, IndianRupee, Wallet } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full pt-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Glassmorphic Container Layer */}
        <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-sm rounded-full px-6 py-3 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-xl text-slate-800 tracking-tight">SmartGrocery <span className="text-emerald-700">AI</span></span>
          </div>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center bg-transparent pointer-events-none">
              <Camera className="h-5 w-5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
            </div>
            
            <input
              type="text"
              placeholder="Search 'Amul Milk 1L'..."
              className="w-full pl-12 pr-12 py-2.5 bg-white/60 border border-white/50 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-slate-700 placeholder-slate-500 shadow-inner transition-all duration-300"
            />
            
            <div className="absolute inset-y-0 right-4 flex items-center">
              <button title="Voice Search" className="hover:bg-slate-200/50 p-1 rounded-full transition-colors">
                <Mic className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            {/* Context Tooltips for UI presentation */}
            <div className="absolute -top-6 left-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
              OCR/Receipt Scan
            </div>
            <div className="absolute -top-6 right-0 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
              Voice Search
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            
            {/* Savings Dashboard Action */}
            <button className="flex flex-col items-center group relative pt-3">
               <div className="absolute -top-1 text-[10px] whitespace-nowrap font-semibold text-slate-600 uppercase tracking-wider scale-0 -translate-y-4 opacity-0 group-hover:scale-100 group-hover:-translate-y-2 group-hover:opacity-100 transition-all">
                  Savings Dashboard
               </div>
               <div className="p-2 bg-white/50 rounded-full border border-slate-200 shadow-sm group-hover:bg-emerald-50 transition-colors">
                  <IndianRupee className="w-5 h-5 text-slate-700 group-hover:text-emerald-700" />
               </div>
               <span className="text-xs font-semibold text-slate-700 mt-1">Savings</span>
            </button>

            {/* Pantry Action */}
            <button className="flex flex-col items-center group pt-3">
               <div className="p-2 bg-white/50 rounded-full border border-slate-200 shadow-sm group-hover:bg-emerald-50 transition-colors">
                  <Wallet className="w-5 h-5 text-slate-700 group-hover:text-emerald-700" />
               </div>
               <span className="text-xs font-semibold text-slate-700 mt-1">Pantry</span>
            </button>

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden cursor-pointer mt-1">
              <img src="https://ui-avatars.com/api/?name=Anjali+Patel&background=10b981&color=fff" alt="User Avatar" />
            </div>

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
