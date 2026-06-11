import React from "react";
import { FolderArchive, Activity, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay Background */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`w-64 fixed top-0 left-0 h-screen bg-black/80 backdrop-blur-3xl border-r border-white/5 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3 w-full">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FX</span>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-950"></div>
            </div>
            <span className="font-display font-bold text-white tracking-wide">Fluxel</span>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors lg:hidden"
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
        <div className="text-[10px] font-mono text-stone-500 font-semibold uppercase tracking-widest px-4 mb-2">
          Deployment
        </div>

        <div
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white shadow-inner font-sans text-sm font-medium"
        >
          <FolderArchive className="w-4 h-4 text-emerald-400" />
          File Drop
        </div>
      </nav>

      {/* Footer System Status */}
      <div className="p-6 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[11px] font-mono text-stone-300">Vercel API</span>
            <span className="text-[10px] text-emerald-500">Connected</span>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
