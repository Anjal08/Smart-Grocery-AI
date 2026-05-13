"use client";

import React, { useRef, useState } from 'react';
import { Sparkles, IndianRupee, Wallet, Search, Loader2, BarChart3, ShieldCheck, ShoppingCart, LogIn, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [previewItems, setPreviewItems] = useState<any[] | null>(null);
  const [detectedStore, setDetectedStore] = useState<string>('Other');
  const [isSaving, setIsSaving] = useState(false);

  const handleScanClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    if (!previewItems) return;
    const newItems = [...previewItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setPreviewItems(newItems);
  };

  const handleConfirmSave = async () => {
    if (!previewItems) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/pantry/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: previewItems,
          storeName: detectedStore
        }),
      });

      if (response.ok) {
        window.dispatchEvent(new Event('inventory-updated'));
        setPreviewItems(null);
      } else {
        alert("Failed to save pantry items.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving items.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isPdf) {
      alert("Invalid file type. Please upload a JPG, PNG, or PDF receipt.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large (Max 10MB).");
      return;
    }

    setIsScanning(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const rawBase64 = event.target?.result as string;
          const base64Data = rawBase64.split(',')[1];
          const mimeType = isPdf ? 'application/pdf' : file.type;

          const response = await fetch('/api/receipt/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image: base64Data, mimeType })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.items?.length > 0) {
              setPreviewItems(data.items);
              setDetectedStore(data.detectedStore || 'Other');
            } else {
              alert("No items found in receipt.");
            }
          } else {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || "Server error");
          }
        } catch (err: any) {
          console.error("Scan error:", err);
          alert(`Scan failed: ${err.message}`);
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
       console.error("Upload error", error);
       setIsScanning(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: <IndianRupee className="w-5 h-5" /> },
    { href: '/inventory', label: 'Inventory', icon: <Wallet className="w-5 h-5" /> },
    { href: '/price-search', label: 'Price Search', icon: <Search className="w-5 h-5" /> },
    { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { href: '/shopping-list', label: 'Shopping List', icon: <ShoppingCart className="w-5 h-5" /> },
    { href: '/health-scanner', label: 'Health Scanner', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  // Get user info from session or fallback
  const userName = session?.user?.name || "Guest User";
  const userImage = session?.user?.image || `https://ui-avatars.com/api/?name=Guest&background=f59e0b&color=fff`;

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#FFF9E6] border-r border-[#F1F5F9] shadow-sm flex flex-col pt-8 pb-6 px-6 z-40">
        
        {/* Branding */}
        <div className="flex items-center gap-2 mb-12">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <span className="font-bold text-2xl text-[#1E293B] tracking-tight">SmartGrocery</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">Menu</div>
          
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 font-bold rounded-xl transition-all ${pathname === item.href ? 'bg-white text-amber-600 shadow-sm border border-[#F1F5F9]' : 'text-[#64748B] hover:bg-white/60 hover:text-amber-600'}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action Button */}
        <div className="mb-6">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button 
            onClick={handleScanClick}
            disabled={isScanning}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Scan Receipt
              </>
            )}
          </button>
        </div>

        {/* User Profile Footer */}
        <div className="flex items-center gap-3 pt-6 border-t border-[#F1F5F9]">
          <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
            {session?.user?.image ? (
              <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-300">
                {session?.user?.name?.charAt(0) || <User className="w-4 h-4" />}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-[#1E293B] leading-none truncate">
              {session ? session.user.name : "Welcome Guest"}
            </p>
            {session ? (
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })} 
                className="text-[10px] font-black text-rose-500 mt-1 uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Secure Logout
              </button>
            ) : (
              <button 
                onClick={() => signIn(undefined, { callbackUrl: "/login" })} 
                className="text-[10px] font-black text-amber-600 mt-1 uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" /> Connect Account
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Preview Modal */}
      {previewItems && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-[#FFF9E6] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-amber-200">
            <div className="p-8 border-b border-amber-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                 <h2 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2">
                   <Sparkles className="w-6 h-6 text-amber-500" />
                   Review Items
                 </h2>
                 <p className="text-[#64748B] text-sm font-medium mt-1">Found {previewItems.length} items from your scan.</p>
               </div>
               
               <div className="w-full md:w-64">
                 <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5 block">Estimated Store</label>
                 <select 
                   value={detectedStore}
                   onChange={(e) => setDetectedStore(e.target.value)}
                   className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-[#1E293B] font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                 >
                   {['Flipkart Minutes', 'Zepto', 'Blinkit', 'BigBasket', 'Other'].map(store => (
                     <option key={store} value={store}>{store}</option>
                   ))}
                 </select>
               </div>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
              {previewItems.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100/50 flex flex-col md:flex-row gap-4 items-center">
                   <div className="flex-1 w-full">
                      <label className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1 block">Item Name</label>
                      <input 
                        className="w-full bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-2 text-[#1E293B] font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      />
                   </div>
                   <div className="w-full md:w-32">
                      <label className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1 block">Price (₹)</label>
                      <input 
                        type="number"
                        className="w-full bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-2 text-[#1E293B] font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                        value={item.price}
                        onChange={(e) => handleUpdateItem(idx, 'price', parseFloat(e.target.value))}
                      />
                   </div>
                   <div className="w-full md:w-44">
                      <label className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1 block">Category</label>
                      <select
                        value={item.category}
                        onChange={(e) => handleUpdateItem(idx, 'category', e.target.value)}
                        className="w-full bg-white border border-amber-100 rounded-xl px-4 py-2 text-[#1E293B] font-bold focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                      >
                        {['Fresh Produce', 'Snacks & Drinks', 'Dairy & Bakery', 'Staples'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                   </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-amber-50/50 border-t border-amber-100 flex flex-col md:flex-row gap-4 justify-end">
               <button 
                 onClick={() => setPreviewItems(null)}
                 disabled={isSaving}
                 className="px-8 py-4 text-[#64748B] font-bold hover:bg-white rounded-2xl transition-all"
               >
                 Discard
               </button>
               <button 
                 onClick={handleConfirmSave}
                 disabled={isSaving}
                 className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
               >
                 {isSaving ? (
                   <>
                     <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                   </>
                 ) : (
                   <>
                     Confirm & Add to Pantry
                   </>
                 )}
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
