import React, { useState } from "react";
import { ExternalLink, Copy, Check, Terminal, Trash2, Globe, Calendar, Loader } from "lucide-react";
import { DeploymentHistoryItem, DeploymentState } from "../types";

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

  const handleCopyLink = (item: DeploymentHistoryItem) => {
    const deploymentUrl = item.url.startsWith("http") ? item.url : `https://${item.url}`;
    navigator.clipboard.writeText(deploymentUrl);
    setCopiedId(item.id);
    addToast(`${item.name} output URL copied.`, "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFrameworkLogo = (framework: string | null) => {
    const f = framework?.toLowerCase() || "static";
    // Returns letters or styling representing framework with premium styling
    if (f === "nextjs") {
      return (
        <span className="w-7 h-7 rounded-lg bg-white text-stone-950 font-display font-extrabold text-[11px] flex items-center justify-center border border-white/10 shadow-md">
          N
        </span>
      );
    }
    if (f === "vite") {
      return (
        <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-amber-300 font-sans font-bold text-xs flex items-center justify-center border border-violet-500/30 shadow-md">
          ⚡
        </span>
      );
    }
    if (f === "astro") {
      return (
        <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-600 to-red-600 text-white font-sans font-extrabold text-[11px] flex items-center justify-center border border-orange-500/30 shadow-md">
          A
        </span>
      );
    }
    if (f === "nuxtjs") {
      return (
        <span className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 font-sans font-bold text-xs flex items-center justify-center border border-emerald-500/20 shadow-md">
          ▲
        </span>
      );
    }
    if (f === "vue") {
      return (
        <span className="w-7 h-7 rounded-lg bg-stone-900 text-teal-400 font-sans font-bold text-xs flex items-center justify-center border border-teal-500/20 shadow-md">
          V
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-lg bg-stone-900 text-stone-400 font-mono font-medium text-xs flex items-center justify-center border border-white/5 shadow-md">
        &lt;&gt;
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
          Success
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
          Building
        </span>
      );
    }
    if (rawState === "QUEUED" || rawState === "PENDING") {
      return (
        <span className={`${base} bg-purple-500/10 text-purple-400 border-purple-500/20`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          Queued
        </span>
      );
    }
    return (
      <span className={`${base} bg-red-500/10 text-red-400 border-red-500/20`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Failed
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
            No Deployments Registered
          </h4>
          <p className="font-sans text-xs text-stone-500 mt-1 max-w-sm leading-relaxed">
            Link your Personal Access Token and execute a ZIP target or GitHub URL to launch a real cloud server instantly.
          </p>
        </div>
      </div>
    );
  }

  // Sort history items so that the latest created deployment appears first
  const sortedItems = [...items].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="flex flex-col gap-4 w-full">
      {sortedItems.map((item) => {
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
            key={item.id}
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
                    Project: {item.name}
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
                    {item.sourceType === "github" ? "GitHub Import" : "ZIP Upload"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action Trigger Rails */}
            <div className="flex flex-wrap items-center gap-2.5 md:self-center">
              {/* Copy URL */}
              <button
                onClick={() => handleCopyLink(item)}
                className="px-3 py-2.5 bg-stone-900 border border-white/5 hover:border-white/10 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 focus:outline-none transition-all"
                title="Copy Domain URL"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy URL
              </button>

              {/* View console logs */}
              <button
                onClick={() => onViewLogs(item)}
                className="px-3.5 py-2.5 bg-stone-900 border border-white/5 hover:border-white/10 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 focus:outline-none transition-all"
                title="View build activities"
              >
                <Terminal className="w-3.5 h-3.5" />
                Console
              </button>

              {/* Open website */}
              <a
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                disabled={item.readyState !== DeploymentState.READY}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none uppercase tracking-wide border ${
                  item.readyState === DeploymentState.READY
                    ? "bg-white border-white hover:bg-stone-200 text-stone-950"
                    : "bg-stone-950/40 border-white/5 text-stone-600 cursor-not-allowed"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Open
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
