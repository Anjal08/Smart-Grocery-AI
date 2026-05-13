"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function UserDropdown() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-3 p-1.5 pr-4 pl-1.5 bg-white border border-slate-100 rounded-full shadow-sm hover:shadow-md hover:border-slate-200 transition-all outline-none group">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shadow-inner">
             {session.user.image ? (
                <img src={session.user.image} alt="User" className="w-full h-full object-contain" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-400">
                   {session.user.name?.charAt(0) || "U"}
                </div>
             )}
          </div>
          <div className="text-left hidden sm:block">
             <p className="text-[10px] font-black text-slate-800 leading-none mb-0.5 tracking-tight uppercase">{session.user.name}</p>
             <p className="text-[10px] font-bold text-slate-400 leading-none tracking-tighter">Premium Executive</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-300 group-data-[state=open]:rotate-180 transition-transform" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          align="end" 
          sideOffset={8}
          className="z-[100] min-w-[200px] bg-white/90 backdrop-blur-xl rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        >
          <DropdownMenu.Label className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Account Management
          </DropdownMenu.Label>
          
          <DropdownMenu.Item asChild>
            <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors outline-none cursor-pointer">
              <User size={14} className="text-slate-400" />
              My Profile
            </Link>
          </DropdownMenu.Item>
          
          <DropdownMenu.Item asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors outline-none cursor-pointer">
              <Settings size={14} className="text-slate-400" />
              Portfolio Settings
            </button>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-slate-100 my-1 mx-2" />

          <DropdownMenu.Item 
            onSelect={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors outline-none cursor-pointer"
          >
            <LogOut size={14} />
            Secure Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
