"use client";

import React, { useState } from "react";
import { Package, Search, Trash2, Loader2, CheckSquare, Square, AlertCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export interface PantryItem {
  _id: string;
  name: string;
  brand: string;
  quantity: number;
  unit: string;
  price?: number;
  category: string;
  purchaseDate: string;
  estimatedExpiryDate: string;
  imageUrl?: string;
}

const CATEGORIES = [
  "Fresh Produce",
  "Dairy & Bakery",
  "Snacks & Beverages",
  "Meat & Seafood",
  "Condiments & Spices",
  "Personal Care",
  "Household Items",
  "Staples & Grains",
];

export default function CategoryList({
  items,
  onRefill,
}: {
  items: PantryItem[];
  onRefill: () => void;
}) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleSelectAll = (catItems: PantryItem[], isSelected: boolean) => {
    const newSelected = new Set(selectedItems);
    catItems.forEach(item => {
      if (isSelected) newSelected.add(item._id);
      else newSelected.delete(item._id);
    });
    setSelectedItems(newSelected);
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.size) return;
    // Removed confirm for demo stability
    
    setIsProcessing("bulk");
    try {
      console.log("Bulk Delete IDs:", Array.from(selectedItems));
      const res = await fetch("/api/pantry", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedItems) })
      });
      
      if (res.ok) {
        setSelectedItems(new Set());
        onRefill();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete items");
      }
    } catch (e) {
      console.error(e);
      alert("Network error. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    // Removed confirm for demo stability
    setIsProcessing(id);
    try {
      await fetch(`/api/pantry/${id}`, { method: "DELETE" });
      onRefill();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(null);
    }
  }

  function getMappedCategory(cat: string): string {
    const c = cat.toLowerCase();
    if (c.includes("beverage") || c.includes("snack") || c.includes("drink")) return "Snacks & Beverages";
    if (c.includes("fruit") || c.includes("veg") || c.includes("produce")) return "Fresh Produce";
    if (c.includes("dairy") || c.includes("bakery") || c.includes("bread") || c.includes("milk")) return "Dairy & Bakery";
    if (c.includes("meat") || c.includes("sea") || c.includes("chicken")) return "Meat & Seafood";
    if (c.includes("condiment") || c.includes("spice") || c.includes("sauce")) return "Condiments & Spices";
    if (c.includes("personal") || c.includes("care") || c.includes("beauty") || c.includes("hygiene")) return "Personal Care";
    if (c.includes("house") || c.includes("clean") || c.includes("detergent")) return "Household Items";
    return "Staples & Grains";
  }

  const handlePriceCheck = (item: PantryItem) => {
    router.push(`/price-search`);
  }

  const getFreshnessStatus = (item: PantryItem, mappedCat: string) => {
    // Simple mock logic for UI improvement suggestion
    const purchase = new Date(item.purchaseDate);
    const now = new Date();
    const daysOld = Math.floor((now.getTime() - purchase.getTime()) / (1000 * 3600 * 24));
    
    if (mappedCat === "Fresh Produce" || mappedCat === "Dairy & Bakery") {
      if (daysOld > 5) return { color: "bg-rose-500", text: "Expiring soon", icon: <AlertCircle size={12}/> };
      if (daysOld > 3) return { color: "bg-amber-400", text: "Consume soon", icon: <Clock size={12}/> };
    }
    return { color: "bg-emerald-500", text: "Fresh", icon: null };
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-32 opacity-50">
         <Package className="w-12 h-12 text-slate-300 mb-4" />
         <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Inventory is empty.</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-32">
      {/* Global Selection Tools */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (selectedItems.size === items.length) setSelectedItems(new Set());
              else setSelectedItems(new Set(items.map(i => i._id)));
            }}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {selectedItems.size === items.length ? <CheckSquare size={16} className="text-indigo-600"/> : <Square size={16}/>}
            {selectedItems.size === items.length ? "Deselect All" : "Select All Items"}
          </button>
          <span className="text-xs font-bold text-slate-300">|</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {selectedItems.size} of {items.length} selected
          </span>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedItems.size > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-6"
          >
            <span className="text-sm font-bold">{selectedItems.size} items selected</span>
            <button 
              onClick={handleBulkDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-2"
            >
              {isProcessing === "bulk" ? <Loader2 className="w-3 h-3 animate-spin"/> : <Trash2 size={14}/>}
              Delete Selected
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {CATEGORIES.map((catName) => {
        const catItems = items.filter((i) => getMappedCategory(i.category) === catName);
        if (catItems.length === 0) return null;
        
        const allSelected = catItems.length > 0 && catItems.every(i => selectedItems.has(i._id));

        return (
          <section key={catName} className="mb-10 relative">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-[#FAF9F6]/90 backdrop-blur-md py-3 px-2 border-b border-slate-200 flex items-center gap-3">
              <button 
                onClick={() => handleSelectAll(catItems, !allSelected)}
                className="text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {allSelected ? <CheckSquare size={18} className="text-indigo-600"/> : <Square size={18}/>}
              </button>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {catName}
              </h2>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {catItems.length}
              </span>
            </div>

            {/* List Rows */}
            <div className="flex flex-col mt-2 rounded-xl border border-slate-100 overflow-hidden shadow-sm">
              {catItems.map((item, index) => {
                const isSelected = selectedItems.has(item._id);
                const freshness = getFreshnessStatus(item, catName);
                
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b last:border-b-0 transition-colors gap-4 sm:gap-0 ${isSelected ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <button 
                        onClick={() => handleSelectItem(item._id)}
                        className="text-slate-300 hover:text-indigo-600 transition-colors"
                      >
                        {isSelected ? <CheckSquare size={18} className="text-indigo-600"/> : <Square size={18}/>}
                      </button>

                      {/* Thumbnail */}
                      <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-black text-slate-300 uppercase">
                            {item.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                            {item.name}
                          </h3>
                          {item.price && (
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-1.5 rounded-sm">
                              ₹{item.price}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            {item.brand || "Generic"}
                          </p>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className={`w-1.5 h-1.5 rounded-full ${freshness.color}`} />
                            {freshness.text}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2 shrink-0 pl-10 sm:pl-0">
                      {/* Quantity */}
                      <div className="flex items-center justify-center">
                        <span className="px-3 py-1 bg-white text-slate-700 text-xs font-bold rounded-full border border-slate-200 shadow-sm whitespace-nowrap">
                          {item.quantity} {item.unit}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePriceCheck(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-bold whitespace-nowrap"
                        >
                          <Search size={14} />
                          Price Check
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors sm:opacity-0 sm:group-hover:opacity-100 rounded-lg hover:bg-rose-50"
                        >
                          {isProcessing === item._id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
