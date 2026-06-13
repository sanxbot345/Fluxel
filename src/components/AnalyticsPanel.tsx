import React from "react";
import { Layers, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { ProjectAnalytics } from "../types";
import { useLanguage } from "../utils/lang";

interface AnalyticsPanelProps {
  analytics: ProjectAnalytics;
}

export default function AnalyticsPanel({ analytics }: AnalyticsPanelProps) {
  const { t } = useLanguage();
  const successRate =
    analytics.total > 0 ? Math.round((analytics.success / analytics.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
      {/* Total Deployments Card */}
      <div className="relative overflow-hidden rounded-2xl liquid-glass p-5 flex flex-col justify-between shadow-lg group hover:border-white/15 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-white/2 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-medium tracking-wider text-stone-500 uppercase">
            {t.totalDeploys}
          </span>
          <div className="p-2 rounded-xl bg-stone-900/50 border border-white/5 text-stone-400 group-hover:text-white transition-colors">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h4 className="font-display text-3xl font-bold tracking-tight text-white mb-1">
            {analytics.total}
          </h4>
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            {t.totalDeploysDesc}
          </span>
        </div>
      </div>

      {/* Success Card */}
      <div className="relative overflow-hidden rounded-2xl liquid-glass p-5 flex flex-col justify-between shadow-lg group hover:border-emerald-500/15 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/2 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-medium tracking-wider text-stone-500 uppercase">
            {t.successfulBuild}
          </span>
          <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/10 text-emerald-500 group-hover:text-emerald-400 transition-colors">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h4 className="font-display text-3xl font-bold tracking-tight text-white mb-1">
            {analytics.success}
          </h4>
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            {t.successfulBuildDesc}
          </span>
        </div>
      </div>

      {/* Failed Card */}
      <div className="relative overflow-hidden rounded-2xl liquid-glass p-5 flex flex-col justify-between shadow-lg group hover:border-rose-500/15 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/2 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-medium tracking-wider text-stone-500 uppercase">
            {t.buildFailures}
          </span>
          <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/10 text-rose-500 group-hover:text-rose-400 transition-colors">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h4 className="font-display text-3xl font-bold tracking-tight text-white mb-1">
            {analytics.failed}
          </h4>
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            {t.buildFailuresDesc}
          </span>
        </div>
      </div>

      {/* Success Rate Card */}
      <div className="relative overflow-hidden rounded-2xl liquid-glass p-5 flex flex-col justify-between shadow-lg group hover:border-blue-500/15 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-medium tracking-wider text-stone-500 uppercase">
            {t.healthRatio}
          </span>
          <div className="p-2 rounded-xl bg-blue-950/20 border border-blue-500/10 text-blue-500 group-hover:text-blue-400 transition-colors">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h4 className="font-display text-3xl font-bold tracking-tight text-white mb-1">
            {successRate}%
          </h4>
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            {t.healthRatioDesc}
          </span>
        </div>
      </div>
    </div>
  );
}
