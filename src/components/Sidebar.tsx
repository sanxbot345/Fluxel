import React from "react";
import { FolderArchive, Activity, X, Languages } from "lucide-react";
import { useLanguage } from "../utils/lang";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  activeTab: "deploy";
  setActiveTab: (val: "deploy") => void;
}

export default function Sidebar({ isOpen, setIsOpen, activeTab, setActiveTab }: SidebarProps) {
  const { lang, toggleLanguage, t } = useLanguage();

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
        className={`w-64 fixed top-0 left-0 h-screen bg-black/80 backdrop-blur-3xl border-r border-r-white/5 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-b-white/5">
          <div className="flex items-center gap-3 w-full">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-emerald-500/10">
                <img 
                  src="/favicon.jpg" 
                  alt="Fluxel Logo" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-950"></div>
            </div>
            <span className="font-display font-bold text-white tracking-wide text-sm whitespace-nowrap">Fluxel Deployment</span>
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
          {t.sidebarTitle}
        </div>

        <button
          onClick={() => {
            setActiveTab("deploy");
            if (isOpen) setIsOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-sans text-sm font-medium cursor-pointer ${
            activeTab === "deploy"
              ? "bg-white/10 text-white shadow-inner border border-white/5"
              : "text-stone-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <FolderArchive className={`w-4 h-4 ${activeTab === "deploy" ? "text-emerald-400" : "text-stone-500"}`} />
          {t.sidebarFileDrop}
        </button>
      </nav>

      {/* Language Auto-detect Indicator (Passive Status - No buttons) */}
      <div className="p-4 mx-4 mb-2 rounded-xl bg-white/[0.02] border border-white/5 font-sans">
        <div className="flex items-center gap-2 mb-1.5 text-stone-400">
          <Languages className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400">
            {lang === "id" ? "Bahasa Sistem" : "System Language"}
          </span>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 bg-stone-900 border border-white/5 rounded-lg">
          <span className="text-xs text-stone-300 font-medium flex items-center gap-1.5">
            {lang === "id" ? "🇮🇩 Indonesia" : "🇬🇧 English"}
          </span>
          <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/10">
            AUTO
          </span>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-6 border-t border-t-white/5 mt-auto">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[11px] font-mono text-stone-300">Cloud Engine</span>
            <span className="text-[10px] text-emerald-500">{t.statusOnline}</span>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
