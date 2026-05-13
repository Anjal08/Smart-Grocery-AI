"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ProductCard: The 'Emoji-First' visual component.
 * Implements 'Safe-Image' logic: falls back to emoji if image fails to load.
 */
const ProductCard = ({ name, imageUrl, emoji, size = "large" }) => {
  const [imgError, setImgError] = useState(false);

  // Generate a soft, consistent background color based on the name
  const getSoftColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 95%)`;
  };

  const isLarge = size === "large";
  const containerClass = isLarge 
    ? "w-48 h-48 rounded-[32px] p-6" 
    : "w-14 h-14 rounded-2xl p-2";
  const emojiSize = isLarge ? "text-6xl" : "text-2xl";

  return (
    <div 
      className={`${containerClass} flex items-center justify-center border border-slate-100 shadow-sm transition-transform duration-500 hover:scale-105 overflow-hidden`}
      style={{ backgroundColor: getSoftColor(name) }}
    >
      {!imgError && imageUrl ? (
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${emojiSize} drop-shadow-sm select-none`}
        >
          {emoji || "📦"}
        </motion.div>
      )}
    </div>
  );
};

export default ProductCard;
