"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SmartNudgeProps {
  message: string;
}

export default function SmartNudge({ message }: SmartNudgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full bg-[#f3e8ff] border border-violet-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm my-6"
    >
      <div className="bg-violet-100 p-2 rounded-xl text-violet-600 shrink-0">
        <Sparkles className="w-5 h-5" />
      </div>
      <p className="text-sm font-bold text-violet-900 leading-tight">
        <span className="text-violet-600 mr-2 uppercase text-[10px] tracking-widest block mb-0.5">
          AI Suggestion
        </span>
        {message}
      </p>
    </motion.div>
  );
}
