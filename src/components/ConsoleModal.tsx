import { useEffect, useRef, useState } from "react";
import { Terminal, X, RefreshCw, AlertCircle, Copy, Check } from "lucide-react";
import { VercelLogEvent } from "../types";

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  deploymentId: string;
  projectName: string;
  token: string;
  readyState: string;
  addToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function ConsoleModal({
  isOpen,
  onClose,
  deploymentId,
  projectName,
  token,
  readyState,
  addToast,
}: ConsoleModalProps) {
  const [logs, setLogs] = useState<VercelLogEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async (silent = false) => {
    if (!token || !deploymentId) return;
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const res = await fetch(`/api/deploy/logs/${deploymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch build activities.");
      }

      if (data.events) {
        // Map raw Vercel events to standard log items
        const mappedLogs: VercelLogEvent[] = data.events.map((event: any, index: number) => ({
          id: event.id || String(index),
          text: event.payload?.text || event.text || "",
          timestamp: event.payload?.date || event.created || Date.now(),
          type: event.payload?.type === "stderr" ? "stderr" : "stdout",
        }));
        setLogs(mappedLogs);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load deployment actions.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Poll for logs while the deployment is BUILDING or QUEUED
  useEffect(() => {
    if (!isOpen || !deploymentId) return;

    fetchLogs();

    const isBuilding = readyState === "BUILDING" || readyState === "QUEUED";
    let intervalId: any = null;

    if (isBuilding) {
      intervalId = setInterval(() => {
        fetchLogs(true);
      }, 3000); // poll every 3 seconds during live compile
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, deploymentId, readyState]);

  // Scroll to bottom whenever logs are updated
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!isOpen) return null;

  const handleCopyLogs = () => {
    const fullText = logs.map((l) => `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.text}`).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    addToast("Console logs copied to clipboard.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogColor = (text: string, type?: string) => {
    const t = text.toLowerCase();
    if (type === "stderr" || t.includes("error") || t.includes("failed") || t.includes("err:")) {
      return "text-rose-400";
    }
    if (t.includes("warning") || t.includes("warn")) {
      return "text-amber-400";
    }
    if (t.includes("success") || t.includes("successfully") || t.includes("ready")) {
      return "text-emerald-400";
    }
    if (t.includes("info") || t.includes("npm") || t.includes("vite")) {
      return "text-cyan-400";
    }
    return "text-stone-300";
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        className="relative w-full max-w-4xl h-[80vh] flex flex-col rounded-2xl liquid-glass-navbar overflow-hidden animate-modal-entrance border border-white/10"
        style={{
          boxShadow: "0 24px 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-stone-900 border border-white/5 text-emerald-400 shadow-inner">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                Deployment Console Logs
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {readyState}
                </span>
              </h3>
              <p className="text-[10px] font-mono text-stone-500 mt-0.5">
                Project: {projectName} • ID: {deploymentId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              onClick={handleCopyLogs}
              disabled={logs.length === 0}
              className="p-2 bg-stone-900 border border-white/5 hover:border-white/10 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-all focus:outline-none disabled:opacity-30 disabled:pointer-events-none"
              title="Copy Console Outputs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Refresh logs */}
            <button
              onClick={() => fetchLogs()}
              disabled={loading}
              className="p-2 bg-stone-900 border border-white/5 hover:border-white/10 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-all focus:outline-none"
              title="Refresh logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 bg-stone-900 border border-white/5 hover:border-white/10 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-all focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Screen body */}
        <div className="flex-1 bg-black/95 p-6 overflow-y-auto font-mono text-xs md:text-[13px] leading-relaxed flex flex-col gap-1.5 scrollbar-thin">
          {loading && logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 select-none text-stone-500 animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span>Attaching virtual secure console pipeline...</span>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 text-rose-400 max-w-lg mx-auto mt-12 select-none">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Failed to connect console stream</h4>
                <p className="text-xs opacity-80 leading-relaxed">{error}</p>
                <p className="text-xs opacity-60 mt-2">Make sure your Access Token has access to this deployment.</p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2.5 text-stone-600 select-none font-sans">
              <Terminal className="w-8 h-8 opacity-40 animate-pulse" />
              <span className="text-xs tracking-wide">Waiting for compilation output queue...</span>
              <span className="text-[10px] opacity-60 font-mono">Build containers are preparing environment specs.</span>
            </div>
          ) : (
            <>
              <div className="text-stone-700 select-none pb-2 border-b border-white/5 mb-2 font-mono text-[11px]">
                🚀 fluxel-terminal-shell attached successfully on container platform.
              </div>
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4">
                  <span className="text-stone-600 font-mono text-[11px] select-none flex-shrink-0 mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={`${getLogColor(log.text, log.type)} whitespace-pre-wrap break-all flex-1 font-mono`}>
                    {log.text}
                  </span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </>
          )}
        </div>

        {/* Terminal Footer Info Pin */}
        <div className="px-6 py-3 border-t border-white/5 bg-stone-950/90 text-[10.5px] font-mono text-stone-500 flex flex-wrap items-center justify-between gap-2.5">
          <span className="flex items-center gap-1.5 leading-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            CONSOLE ACTIVE • STREAMING SECURE PIPE
          </span>
          <span>
            Powered by Fluxel Serverless Build Infrastructure
          </span>
        </div>
      </div>
    </div>
  );
}
