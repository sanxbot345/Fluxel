import { useState, useEffect } from "react";
import { Sparkles, Activity, Menu, Info, X, ChevronRight, Shield, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DeploymentHistoryItem, DeploymentState, ProjectAnalytics } from "./types";
import ParticleBackground from "./components/ParticleBackground";
import Sidebar from "./components/Sidebar";
import Toast, { ToastItem } from "./components/Toast";
import AnalyticsPanel from "./components/AnalyticsPanel";
import DeployZipForm from "./components/DeployZipForm";
import DeploymentList from "./components/DeploymentList";
import ConsoleModal from "./components/ConsoleModal";
import AnimatedHeroText from "./components/AnimatedHeroText";
import { useLanguage } from "./utils/lang";

export default function App() {
  const { lang, toggleLanguage, t } = useLanguage();
  
  // Vercel token is securely managed on the backend script level
  const [token] = useState<string>("script_token");

  const [activeTab, setActiveTab] = useState<"deploy">("deploy");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  
  // Isolated multi-user deployment archives representation
  const [history, setHistory] = useState<DeploymentHistoryItem[]>([]);

  // Track active item being viewed in the console terminal
  const [selectedConsoleItem, setSelectedConsoleItem] = useState<DeploymentHistoryItem | null>(null);

  // Track active item being verified for deletion
  const [itemToDelete, setItemToDelete] = useState<DeploymentHistoryItem | null>(null);

  // Sync isolated user/guest history back on state modification
  useEffect(() => {
    try {
      const stored = localStorage.getItem("fluxel_deploy_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("fluxel_deploy_history", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to sync history state with localStorage", e);
    }
  }, [history]);

  // Toast notifier helper
  const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Triggered when a new deployment process is initiated
  const handleDeployStart = () => {
    addToast(t.initConnection, "info");
  };

  // Triggered when deployment is successfully compiled / added to Vercel queue
  const handleDeploySuccess = (newDeploy: any) => {
    let finalUrl = newDeploy.url;
    if (newDeploy.alias && Array.isArray(newDeploy.alias) && newDeploy.alias.length > 0) {
      finalUrl = newDeploy.alias[0];
    }

    const historyItem: DeploymentHistoryItem = {
      id: newDeploy.id,
      name: newDeploy.name,
      url: finalUrl,
      readyState: newDeploy.readyState as DeploymentState,
      createdAt: newDeploy.createdAt || Date.now(),
      framework: newDeploy.framework,
      sourceType: newDeploy.sourceType,
      gitRepoUrl: newDeploy.gitRepoUrl,
      gitBranch: newDeploy.gitBranch,
      target: newDeploy.target || "vercel",
    };

    setHistory((prev) => [historyItem, ...prev]);
    addToast(`${t.successfullyQueued} ${finalUrl}!`, "success");
  };

  const handleDeployError = (errMessage: string) => {
    addToast(`Pipeline execution failed: ${errMessage}`, "error");
  };

  // Poll Vercel API for status updates of building / queued pipelines
  useEffect(() => {
    const activeRunningItems = history.filter(
      (item) =>
        item.readyState === DeploymentState.QUEUED ||
        item.readyState === DeploymentState.BUILDING ||
        item.readyState === DeploymentState.INITIALIZING ||
        item.readyState === DeploymentState.ANALYZING ||
        item.readyState === DeploymentState.DEPLOYING
    );

    if (activeRunningItems.length === 0) return;

    const intervalId = setInterval(async () => {
      await Promise.all(
        activeRunningItems.map(async (item) => {
          try {
            const res = await fetch(`/api/deploy/status/${item.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) return;

            const contentType = res.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) return;

            const data = await res.json().catch(() => null);
            if (!data) return;

            if (data.readyState && data.readyState !== item.readyState) {
              // Update status in local history!
              setHistory((prev) =>
                prev.map((h) => {
                  if (h.id === item.id) {
                    let fetchedUrl = data.url;
                    if (data.alias && Array.isArray(data.alias) && data.alias.length > 0) {
                      fetchedUrl = data.alias[0];
                    }
                    const displayUrl = fetchedUrl || h.url;
                    const updated = { ...h, readyState: data.readyState as DeploymentState, url: displayUrl };
                    if (data.readyState === DeploymentState.READY) {
                      addToast(`Build Completed! "${displayUrl}" is now online!`, "success");
                    } else if (data.readyState === DeploymentState.ERROR) {
                      addToast(`Build Failed: error during compiling "${displayUrl}".`, "error");
                    }
                    return updated;
                  }
                  return h;
                })
              );
            }
          } catch (e) {
            console.error("Polled query failed", e);
          }
        })
      );
    }, 4000); // query every 4 seconds

    return () => clearInterval(intervalId);
  }, [history, token]);

  // Explicitly poll/refresh an item's status
  const handleRefreshItem = async (item: DeploymentHistoryItem) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/deploy/status/${item.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        addToast("Unable to synchronize with server state.", "error");
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        addToast("Server returned an invalid configuration response.", "error");
        return;
      }

      const data = await res.json().catch(() => null);
      if (!data) {
        addToast("Could not parse status information.", "error");
        return;
      }

      setHistory((prev) =>
        prev.map((h) => {
          if (h.id === item.id) {
            let fetchedUrl = data.url;
            if (data.alias && Array.isArray(data.alias) && data.alias.length > 0) {
              fetchedUrl = data.alias[0];
            }
            return { ...h, readyState: data.readyState as DeploymentState, url: fetchedUrl || h.url };
          }
          return h;
        })
      );
      addToast(`Refreshed build state for ${item.name}.`, "info");
    } catch {
      addToast("Failed to refresh status.", "error");
    }
  };

  // Delete deployment from history AND call Vercel api to tear down if possible
  const handleDeleteItem = async (id: string) => {
    const item = history.find((h) => h.id === id);
    if (!item) return;
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const item = itemToDelete;
    setItemToDelete(null); // Close the confirmation modal

    try {
      if (token) {
        // Carry out cloud teardown and clean up on Vercel
        fetch(`/api/deploy/delete/${item.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => {
          if (res.ok) {
            addToast(`${t.toreDownSuccess} ${item.name}.`, "success");
          } else {
            addToast(`${t.toreDownVercel} ${item.name}.`, "info");
          }
        }).catch((err) => {
          console.error("Vercel deletion API error:", err);
        });
      }
    } catch (e) {
      console.error(e);
    }

    setHistory((prev) => prev.filter((h) => h.id !== item.id));
    addToast(`${t.removedRecords} (${item.name})`, "info");
  };

  // Compile analytics values based on history items
  const analytics: ProjectAnalytics = {
    total: history.length,
    success: history.filter((h) => {
      const state = (h.readyState || "").toString().toUpperCase().trim();
      return state === "READY" || state === "SUCCESS" || state === "LIVE";
    }).length,
    failed: history.filter((h) => {
      const state = (h.readyState || "").toString().toUpperCase().trim();
      return state === "ERROR" || state === "FAILED" || state === "CANCELED";
    }).length,
  };

  return (
    <div className="relative min-h-screen supports-[min-height:100dvh]:min-h-[100dvh] text-stone-200 bg-[#050505] overflow-x-hidden font-sans pb-10 md:pb-20 flex flex-row">
      {/* Visual background elements */}
      <ParticleBackground />

      {/* Sidebar Layout */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Dashboard Panel layout */}
      <main className={`relative flex-1 w-full min-h-screen transition-all duration-300 z-10 ${isSidebarOpen ? 'lg:pl-64' : 'pl-0'}`}>
        <div className="max-w-7xl mx-auto flex flex-col gap-4 md:gap-8 w-full pb-8">
          {/* Main Top control bar (Persistent Sidebar Toggle and Sparkles, consistent across all tabs) */}
          <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl px-4 md:px-8 lg:px-12 xl:px-16 pt-6 sm:pt-12 md:pt-16 pb-4 flex items-center justify-between w-full border-b border-white/5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-xl bg-stone-900 border border-white/5 hover:bg-stone-850 text-stone-400 hover:text-white transition-all shadow-inner cursor-pointer"
                title="Toggle Sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono font-semibold tracking-wider text-emerald-400 uppercase">
                  {activeTab === "deploy" ? t.serverEngines : "FLUXEL EDGE SYSTEM"}
                </span>
              </div>
            </div>

            {activeTab === "deploy" && (
              <button
                onClick={() => setIsDisclaimerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 hover:border-amber-500/35 shadow-lg shadow-amber-500/5 transition-all cursor-pointer active:scale-95 duration-150"
                style={{ borderRadius: "100px" }}
                id="disclaimer-button"
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.disclaimerBtn}</span>
              </button>
            )}
          </div>
          
          <div className="flex flex-col gap-4 md:gap-8 px-4 md:px-8 lg:px-12 xl:px-16 w-full">
            <AnimatedHeroText 
              title={t.heroTitle} 
              description={t.heroDesc} 
            />

          {/* Real-time Scoreboard metrics */}
          <AnalyticsPanel analytics={analytics} />

          {/* Dashboard Actions Grid Splitter */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start w-full">
            {/* Left: Dispatcher Form panels (5 columns size) */}
            <section className="lg:col-span-12 xl:col-span-5 rounded-3xl liquid-glass p-4 sm:p-6 md:p-8 border border-white/5 shadow-2xl bg-black/20">
              <DeployZipForm
                token={token}
                onDeployStart={handleDeployStart}
                onDeploySuccess={handleDeploySuccess}
                onDeployError={handleDeployError}
                addToast={addToast}
              />
            </section>

            {/* Right: History registries list (7 columns size) */}
            <section className="lg:col-span-12 xl:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-display font-semibold text-white text-base tracking-wide flex items-center gap-2">
                  {t.activePipelinesTitle}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 text-stone-500 border border-white/5 font-medium leading-none">
                    {history.length} {t.activePipelinesStatus}
                  </span>
                </h3>
              </div>

              <DeploymentList
                items={history}
                token={token}
                onViewLogs={setSelectedConsoleItem}
                onDeleteItem={handleDeleteItem}
                onRefreshItem={handleRefreshItem}
                addToast={addToast}
              />
            </section>
          </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-stone-600 text-xs py-4 border-t border-white/5">
            <p className="mb-1">© 2026 Fluxel Deployment. All rights reserved.</p>
            <p>Fluxel Deployment is developed and maintained by Fluxel Deployment.</p>
          </footer>
        </div>
      </main>

      {/* Universal Floating Modals */}
      <ConsoleModal
        isOpen={!!selectedConsoleItem}
        onClose={() => setSelectedConsoleItem(null)}
        deploymentId={selectedConsoleItem?.id || ""}
        projectName={selectedConsoleItem?.name || ""}
        token={token}
        readyState={selectedConsoleItem?.readyState || ""}
        addToast={addToast}
      />

      {/* Custom Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setItemToDelete(null)} />
          <div 
            className="relative w-full max-w-md p-6 rounded-2xl border border-white/10 bg-stone-950/90 shadow-2xl backdrop-blur-xl liquid-glass text-center animate-modal-entrance"
            style={{
              boxShadow: "0 24px 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {/* Design header */}
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 shadow-inner">
              <span className="text-xl font-bold font-mono">⚠️</span>
            </div>
            
            <h4 className="font-display font-semibold text-lg text-white mb-2 tracking-wide">
              {t.confirmDeleteTitle}
            </h4>
            
            <p className="text-stone-400 text-sm mb-6 leading-relaxed">
              {t.confirmDeleteDescPart1} <span className="text-white font-mono bg-stone-900 border border-white/5 px-1.5 py-0.5 rounded text-xs">{itemToDelete.name}</span>?<br />
              {t.confirmDeleteDescPart2}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-850 border border-white/5 text-stone-300 text-xs font-semibold rounded-xl transition-all shadow-inner hover:text-white"
              >
                {t.cancelBtn}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/20 transition-all border border-rose-500/20"
              >
                {t.confirmDeleteBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer Modal */}
      <AnimatePresence>
        {isDisclaimerOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsDisclaimerOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
              className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-white/10 bg-stone-950 shadow-2xl overflow-hidden"
              style={{
                boxShadow: "0 24px 60px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              <button
                onClick={() => setIsDisclaimerOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-xl bg-stone-900 border border-white/5 hover:bg-stone-850 text-stone-400 hover:text-white transition-all duration-150 cursor-pointer active:scale-95"
                title="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Design header */}
              <div className="flex items-center gap-4 mb-5 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-base sm:text-lg text-white leading-tight">
                    {t.disclaimerTitle}
                  </h4>
                  <span className="text-[10px] font-mono text-amber-500/80 tracking-wider uppercase">System Protocol Protection</span>
                </div>
              </div>
              
              <div className="text-stone-300 text-xs sm:text-sm mb-6 space-y-4 max-h-[50vh] overflow-y-auto pr-2 leading-relaxed">
                <p className="text-stone-300 font-sans text-sm">
                  {t.disclaimerText1}
                </p>
                
                <div className="p-3.5 bg-amber-500/[0.03] rounded-2xl border border-amber-500/10 text-amber-300 text-xs flex flex-col gap-1.5 font-sans">
                  <span className="font-semibold block text-amber-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {t.disclaimerSupportTitle}
                  </span>
                  <span className="text-amber-300/80 leading-relaxed">
                    {t.disclaimerSupportDesc}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex gap-3.5 items-start p-3.5 rounded-2xl border border-white/5 bg-stone-900/20 hover:bg-stone-900/40 transition-colors">
                    <div className="mt-0.5 p-1 rounded-lg bg-stone-900 border border-white/5 text-amber-500 shrink-0">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-stone-200 text-xs tracking-wide block mb-0.5">{t.disclaimerPoint1Title}</strong>
                      <span className="text-stone-400 text-xs leading-relaxed block">{t.disclaimerPoint1Desc}</span>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start p-3.5 rounded-2xl border border-white/5 bg-stone-900/20 hover:bg-stone-900/40 transition-colors">
                    <div className="mt-0.5 p-1 rounded-lg bg-stone-900 border border-white/5 text-amber-500 shrink-0">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-stone-200 text-xs tracking-wide block mb-0.5">{t.disclaimerPoint2Title}</strong>
                      <span className="text-stone-400 text-xs leading-relaxed block">{t.disclaimerPoint2Desc}</span>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start p-3.5 rounded-2xl border border-white/5 bg-stone-900/20 hover:bg-stone-900/40 transition-colors">
                    <div className="mt-0.5 p-1 rounded-lg bg-stone-900 border border-white/5 text-amber-500 shrink-0">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-stone-200 text-xs tracking-wide block mb-0.5">{t.disclaimerPoint3Title}</strong>
                      <span className="text-stone-400 text-xs leading-relaxed block">{t.disclaimerPoint3Desc}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                <button
                  onClick={() => setIsDisclaimerOpen(false)}
                  className="w-full px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-2xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all border border-amber-400/20 font-mono tracking-wider text-center cursor-pointer active:scale-[0.98]"
                >
                  {t.disclaimerUnderstand}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Push Notifier Container */}
      <Toast toasts={toasts} setToasts={setToasts} />
    </div>
  );
}
