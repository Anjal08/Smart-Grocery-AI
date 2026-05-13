"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  User, Mail, Bell, Zap, Shield, LogOut, 
  ChevronRight, ArrowLeft, Camera, Loader2 
} from "lucide-react";
import Link from "next/link";
import * as Switch from "@radix-ui/react-switch";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [notifs, setNotifs] = useState(true);
  const [aiReports, setAiReports] = useState(true);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    // Placeholder for profile update logic
    setTimeout(() => setIsUpdating(false), 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="relative group mb-6">
                 <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100">
                    {session?.user?.image ? (
                       <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-300 uppercase">
                          {session?.user?.name?.charAt(0) || "U"}
                       </div>
                    )}
                 </div>
                 <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Camera className="w-3.5 h-3.5" />
                 </button>
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{session?.user?.name || "Executive User"}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{session?.user?.email}</p>
              
              <div className="mt-8 pt-8 border-t border-slate-50 w-full">
                 <button 
                   onClick={() => signOut({ callbackUrl: "/login" })}
                   className="w-full flex items-center justify-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-50 py-3 rounded-xl transition-colors"
                 >
                    <LogOut className="w-3 h-3" />
                    Secure Sign Out
                 </button>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Section 1: Account Info */}
           <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <User size={16} />
                 </div>
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Account Portfolio</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                    <input 
                       type="text" 
                       defaultValue={session?.user?.name || ""}
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Email</label>
                    <input 
                       type="email" 
                       readOnly
                       defaultValue={session?.user?.email || ""}
                       className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 outline-none cursor-not-allowed font-mono"
                    />
                 </div>
              </div>
              
              <button 
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin"/> : null}
                Save Changes
              </button>
           </div>

           {/* Section 2: Preferences Toggles */}
           <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Bell size={16} />
                 </div>
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Global Preferences</h3>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <p className="text-sm font-black text-slate-800 tracking-tight">Push Notifications</p>
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Daily inventory state alerts</p>
                    </div>
                    <Switch.Root 
                      checked={notifs}
                      onCheckedChange={setNotifs}
                      className="w-10 h-5 bg-slate-200 rounded-full relative data-[state=checked]:bg-emerald-500 transition-colors outline-none cursor-pointer"
                    >
                      <Switch.Thumb className="block w-4 h-4 bg-white rounded-full translate-x-0.5 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[22px]" />
                    </Switch.Root>
                 </div>

                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <p className="text-sm font-black text-slate-800 tracking-tight">Weekly AI Portfolio Reports</p>
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Detailed spending & nutrition analytics</p>
                    </div>
                    <Switch.Root 
                      checked={aiReports}
                      onCheckedChange={setAiReports}
                      className="w-10 h-5 bg-slate-200 rounded-full relative data-[state=checked]:bg-emerald-500 transition-colors outline-none cursor-pointer"
                    >
                      <Switch.Thumb className="block w-4 h-4 bg-white rounded-full translate-x-0.5 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[22px]" />
                    </Switch.Root>
                 </div>
              </div>
           </div>

           {/* Section 3: Security & Advanced */}
           <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                    <Shield size={16} />
                 </div>
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Security Protocol</h3>
              </div>
              
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-center justify-between">
                 <div>
                    <p className="text-xs font-black text-rose-900 tracking-tight uppercase">Multi-device Session</p>
                    <p className="text-[10px] font-medium text-rose-600/60 uppercase mt-0.5">Terminate all active sessions globally</p>
                 </div>
                 <button className="px-4 py-2 bg-white border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                    Logout All
                 </button>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
