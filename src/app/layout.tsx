import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartGrocery AI",
  description: "Professional Lucknow grocery assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen text-[#1E293B] bg-[#FFFDF5] flex`}>
        <SessionProvider>
          {/* Fixed Sidebar */}
          <Sidebar />
          
          {/* Main Content Area (offset by sidebar width) */}
          <div className="flex-1 ml-64 flex flex-col min-h-screen">
            <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-8">
              {children}
            </main>
            
            <footer className="mt-auto border-t border-[#F1F5F9] bg-[#FFFDF5] py-8">
              <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-[#64748B]">
                 <div>SmartGrocery AI &copy; 2026</div>
                 <div>Made with ❤️ by Anjali Patel | Lucknow, India</div>
                 <div className="flex gap-4">
                    <span className="cursor-pointer hover:text-amber-500">Privacy</span>
                    <span className="cursor-pointer hover:text-amber-500">Terms</span>
                 </div>
              </div>
            </footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
