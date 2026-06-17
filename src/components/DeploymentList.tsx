import React, { useState } from "react";
import { ExternalLink, Copy, Check, Terminal, Trash2, Globe, Calendar, Loader } from "lucide-react";
import { DeploymentHistoryItem, DeploymentState } from "../types";
import { useLanguage } from "../utils/lang";

interface DeploymentListProps {
  items: DeploymentHistoryItem[];
  token: string;
  onViewLogs: (item: DeploymentHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onRefreshItem: (item: DeploymentHistoryItem) => void;
  addToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function DeploymentList({
  items,
  token,
  onViewLogs,
  onDeleteItem,
  onRefreshItem,
  addToast,
}: DeploymentListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleCopyLink = (item: DeploymentHistoryItem) => {
    const deploymentUrl = item.url.startsWith("http") ? item.url : `https://${item.url}`;
    navigator.clipboard.writeText(deploymentUrl);
    setCopiedId(item.id);
    addToast(`${item.name} ${t.toastCopied}`, "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFrameworkLogo = (framework: string | null) => {
    const f = framework?.toLowerCase() || "detect";
    
    if (f === "vite") {
      return (
        <span className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/20 shadow-md flex items-center justify-center p-1.5 transition-transform duration-300 hover:scale-105" title="Vite Project">
          <svg className="w-full h-full" viewBox="0 0 410 410" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M380.08 72.88L211.59 389.28C209.68 392.83 204.6 392.81 202.72 389.24L34.1 68.74C32.17 65.07 35.17 60.84 39.31 61.34L206.59 81.33C207.28 81.41 207.97 81.41 208.66 81.33L374.83 61.37C378.97 60.87 381.99 65.13 380.08 72.88Z" fill="url(#vite-list-bg-grad)" />
            <path d="M228.61 14.52L201.76 137.98C201.27 140.23 203.4 142.1 205.5 141.18L262.24 116.4C265.41 115.01 268.42 118.82 266.38 121.65L173.86 249.71C172.07 252.19 174.45 255.43 177.21 254.34L228.68 234.02C231.81 232.78 234.79 236.42 232.89 239.14L157.41 346.7C154.55 350.78 148.16 347.88 149.33 342.94L183.1 199.98C183.58 197.94 181.67 196.22 179.79 197.02L131.67 217.47C128.53 218.8 125.5 214.94 127.65 212.06L220.73 87.79C222.51 85.41 220.25 82.16 217.48 83.18L165.73 102.16C162.61 103.3 159.66 99.69 161.48 96.97L219.04 11.23C220.89 8.48 225.26 10.45 224.28 13.8L228.61 14.52Z" fill="url(#vite-list-bolt-grad)" />
            <defs>
              <linearGradient id="vite-list-bg-grad" x1="41.35" y1="61" x2="330.45" y2="340.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#41D1FF" />
                <stop offset="1" stopColor="#BD34FE" />
              </linearGradient>
              <linearGradient id="vite-list-bolt-grad" x1="171" y1="11" x2="161" y2="346" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF7E00" />
                <stop offset="0.5" stopColor="#FF007A" />
                <stop offset="1" stopColor="#FFEA00" />
              </linearGradient>
            </defs>
          </svg>
        </span>
      );
    }
    if (f === "nextjs") {
      return (
        <span className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 shadow-md flex items-center justify-center p-1 transition-transform duration-300 hover:scale-105" title="Next.js Project">
          <svg className="w-full h-full" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="90" cy="90" r="88" fill="#000000" stroke="#333333" strokeWidth="4" />
            <path d="M149.508 157.52L69.142 54H54v72h14.4V68.736l66.528 85.523c4.896-4.608 9.216-9.792 12.96-15.12z" fill="url(#nextjs-list-grad)" />
            <rect x="111.6" y="54" width="14.4" height="72" fill="url(#nextjs-list-grad)" />
            <defs>
              <linearGradient id="nextjs-list-grad" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </span>
      );
    }
    if (f === "express") {
      return (
        <span className="w-8 h-8 rounded-xl bg-stone-900 border border-white/10 shadow-md flex items-center justify-center p-1 transition-transform duration-300 hover:scale-105" title="Express Node Server">
          <svg className="w-full h-full" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 38H56V48H38V58H52V68H38V78H56V88H24V38Z" fill="#FFFFFF" />
            <path d="M64 38L78 64L64 90H78L88 72L98 90H112L98 64L112 38H98L88 56L78 38H64Z" fill="#FFFFFF" />
          </svg>
        </span>
      );
    }
    if (f === "python") {
      return (
        <span className="w-8 h-8 rounded-xl bg-stone-900 border border-white/5 shadow-md flex items-center justify-center p-1 transition-transform duration-300 hover:scale-105" title="Python Instance">
          <svg className="w-full h-full" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M51.2 5C28.2 5 29.8 14.9 29.8 14.9L29.9 25.1H51.7V28.2H21.5C21.5 28.2 5 26.6 5 49.3C5 72 18.2 71.3 18.2 71.3H26.1V60.2C26.1 45.4 37.6 44.9 37.6 44.9H59.5V23.7C59.5 23.7 61.5 5 51.2 5Z" fill="#3776AB" />
            <path d="M59 105C82 105 80.4 95.1 80.4 95.1L80.3 84.9H58.5V81.8H88.7C88.7 81.8 105.2 83.4 105.2 60.7C105.2 38 92 38.7 92 38.7H84.1V49.8C84.1 64.6 72.6 65.1 72.6 65.1H50.7V86.3C50.7 86.3 48.7 105 59 105Z" fill="#FFE873" />
            <circle cx="39.5" cy="14.5" r="3.5" fill="#ffffff" />
            <circle cx="70.5" cy="95.5" r="3.5" fill="#3776AB" />
          </svg>
        </span>
      );
    }
    if (f === "astro") {
      return (
        <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-red-600 text-white font-sans font-extrabold text-xs flex items-center justify-center border border-orange-500/30 shadow-md transition-transform duration-300 hover:scale-105" title="Astro Project">
          A
        </span>
      );
    }
    if (f === "vue" || f === "nuxtjs" || f === "nuxt") {
      return (
        <span className="w-8 h-8 rounded-xl bg-teal-950/20 border border-teal-500/20 text-teal-400 font-sans font-semibold text-xs flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-105" title="Vue/Nuxt Project">
          ▲
        </span>
      );
    }
    // Generic Static / Auto-Detect (Show a beautiful gold/cyan terminal code bracket icon matching premium SaaS styling)
    return (
      <span className="w-8 h-8 rounded-xl bg-stone-900 border border-white/5 shadow-md flex items-center justify-center p-1.5 transition-transform duration-300 hover:scale-105" title="Static Deployment">
        <svg className="w-full h-full text-emerald-400 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      </span>
    );
  };

  const getStatusBadge = (state: DeploymentState) => {
    let base = "px-2.5 py-1 rounded-full text-[10.5px] font-mono font-medium border flex items-center gap-1.5 shadow-sm ";
    const rawState = (state || "").toString().toUpperCase().trim();
    if (rawState === "READY" || rawState === "SUCCESS" || rawState === "LIVE" || rawState === "DONE") {
      return (
        <span className={`${base} bg-green-500/10 text-green-400 border-green-500/20`}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          {t.stateSuccess}
        </span>
      );
    }
    if (
      rawState === "BUILDING" ||
      rawState === "INITIALIZING" ||
      rawState === "ANALYZING" ||
      rawState === "DEPLOYING" ||
      rawState === "PROCESSING"
    ) {
      return (
        <span className={`${base} bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse`}>
          <svg className="animate-spin h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {t.stateBuilding}
        </span>
      );
    }
    if (rawState === "QUEUED" || rawState === "PENDING") {
      return (
        <span className={`${base} bg-purple-500/10 text-purple-400 border-purple-500/20`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          {t.stateQueued}
        </span>
      );
    }
    return (
      <span className={`${base} bg-red-400/10 text-red-400 border-red-400/20`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        {t.stateFailed}
      </span>
    );
  };

  if (items.length === 0) {
    return (
      <div className="w-full py-16 px-6 liquid-glass rounded-2xl flex flex-col items-center justify-center text-center gap-4 border border-white/5 select-none animate-modal-entrance">
        {/* Empty placeholder banner */}
        <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-white/5 text-stone-500 flex items-center justify-center shadow-inner">
          <Globe className="w-5 h-5 opacity-60" />
        </div>
        <div>
          <h4 className="font-display text-base font-semibold text-stone-200">
            {t.noDeploysTitle}
          </h4>
          <p className="font-sans text-xs text-stone-500 mt-1 max-w-sm leading-relaxed">
            {t.noDeploysDesc}
          </p>
        </div>
      </div>
    );
  }

  // Sort history items so that the latest created deployment appears first
  const sortedItems = [...items].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="flex flex-col gap-4 min-w-0">
      {sortedItems.map((item, index) => {
        // Ensure Vercel deployment hash URLs (e.g. index-g81h29-scope.vercel.app) are cleaned to the primary production domain with hobby/team suffix preserved
        let cleanVercelDomain = item.url || "";
        if (item.target !== "render" && cleanVercelDomain.includes(".vercel.app") && item.name) {
          const hostname = cleanVercelDomain.replace(/^(http:\/\/|https:\/\/)/, "");
          const prefix = `${item.name}-`;
          if (hostname.startsWith(prefix)) {
            const remaining = hostname.substring(prefix.length);
            const parts = remaining.split("-");
            if (parts.length > 1) {
              const suffix = parts.slice(1).join("-");
              cleanVercelDomain = `${item.name}-${suffix}`;
            }
          }
        }
          
        const deploymentUrl = cleanVercelDomain.startsWith("http") ? cleanVercelDomain : `https://${cleanVercelDomain}`;
        const isProcessing =
          item.readyState === DeploymentState.BUILDING ||
          item.readyState === DeploymentState.QUEUED ||
          item.readyState === DeploymentState.INITIALIZING ||
          item.readyState === DeploymentState.ANALYZING ||
          item.readyState === DeploymentState.DEPLOYING;

        return (
          <div
            key={`${item.id}-${index}`}
            className="group relative overflow-hidden rounded-2xl liquid-glass p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-white/5 hover:border-white/12 hover:shadow-2xl transition-all duration-300 animate-modal-entrance"
            style={{
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
            }}
          >
            {/* Soft inner cards visual effects */}
            <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-white/1 to-transparent pointer-events-none" />

            {/* Left Info Column */}
            <div className="flex items-start gap-4">
              <div className="mt-1">{getFrameworkLogo(item.framework)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display font-semibold text-white hover:text-emerald-400 transition-colors tracking-wide truncate max-w-xs md:max-w-md flex items-center gap-1.5 group/title"
                  >
                    <span>{cleanVercelDomain}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover/title:opacity-100 text-stone-400 group-hover/title:text-emerald-400 transition-colors" />
                  </a>
                  {getStatusBadge(item.readyState)}
                  {item.target === "render" ? (
                    <span className="px-2 py-0.5 rounded-md bg-[#6c5bfa]/10 border border-[#6c5bfa]/20 text-[10px] font-bold text-[#6c5bfa] uppercase tracking-widest shadow-sm">
                      FLUXEL
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-300 text-[10px] font-bold text-stone-900 uppercase tracking-widest shadow-sm">
                      FLUXEL
                    </span>
                  )}
                  {isProcessing && (
                    <button
                      onClick={() => onRefreshItem(item)}
                      className="p-1 hover:bg-stone-900 rounded-lg text-stone-500 hover:text-white transition-all focus:outline-none"
                      title="Refresh compilation state"
                    >
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[11.5px] font-mono text-stone-500 mt-2">
                  <span className="px-2 py-0.5 rounded bg-stone-950 border border-white/5 text-[10.5px]">
                    {t.projectLabel}: {item.name}
                  </span>

                  <span className="flex items-center gap-1 select-none">
                    <Calendar className="w-3.5 h-3.5 opacity-60" />
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  <span className="px-2 py-0.5 rounded bg-stone-950 border border-white/5 text-[9.5px]">
                    {item.sourceType === "github" ? t.githubImportLabel : t.zipUploadLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action Trigger Rails */}
            <div className="flex flex-wrap items-center gap-2.5 md:self-center">
              {/* Copy URL */}
              <button
                onClick={() => handleCopyLink(item)}
                className="px-3 py-2.5 bg-stone-900 border border-white/5 hover:border-white/10 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 focus:outline-none transition-all cursor-pointer"
                title="Copy Domain URL"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {t.copyUrlBtn}
              </button>

              {/* View console logs */}
              <button
                onClick={() => onViewLogs(item)}
                className="px-3.5 py-2.5 bg-stone-900 border border-white/5 hover:border-white/10 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 focus:outline-none transition-all cursor-pointer"
                title="View build activities"
              >
                <Terminal className="w-3.5 h-3.5" />
                {t.consoleBtn}
              </button>

              {/* Open website */}
              <a
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                disabled={item.readyState !== DeploymentState.READY}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none uppercase tracking-wide border cursor-pointer ${
                  item.readyState === DeploymentState.READY
                    ? "bg-white border-white hover:bg-stone-200 text-stone-950"
                    : "bg-stone-950/40 border-white/5 text-stone-600 cursor-not-allowed"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                {t.openBtn}
              </a>

              {/* Delete item */}
              <button
                onClick={() => onDeleteItem(item.id)}
                className="p-3 bg-stone-900/40 border border-white/5 hover:bg-red-950/20 hover:border-red-500/20 text-stone-500 hover:text-red-400 rounded-xl transition-all focus:outline-none"
                title="Delete from list & cloud"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
