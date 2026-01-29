import React, { useMemo, useState, useEffect } from "react";
import { Home, Undo2, RefreshCcw, RotateCcw } from "lucide-react";

type TopNavProps = {
  onUndo: () => void;
  canUndo: boolean;
  onRefresh: () => void;
  lastRefreshAt: number;
};

export default function TopNav({
  onUndo,
  canUndo,
  onRefresh,
  lastRefreshAt,
}: TopNavProps) {
  const [showSynced, setShowSynced] = useState(false);

  useEffect(() => {
    if (lastRefreshAt === 0) return;

    setShowSynced(true);
    const timer = setTimeout(() => setShowSynced(false), 500);
    return () => clearTimeout(timer);
  }, [lastRefreshAt]);

  const dateStr = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur border-b border-sky-500/20 flex items-center justify-between px-6 z-50 shadow-lg">
      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-2 text-white/80 hover:text-sky-400 transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-sky-500/50">
          <Home size={18} />
          <span className="font-medium text-sm">Home</span>
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all ${
            canUndo
              ? "text-white/80 border-white/10 bg-white/5 hover:text-sky-400 hover:border-sky-500/50"
              : "text-white/20 border-white/5 bg-transparent cursor-not-allowed"
          }`}
        >
          <Undo2 size={18} />
          <span className="font-medium text-sm">Undo</span>
        </button>

        <button
          onClick={onRefresh}
          className="relative p-2 text-sky-400 hover:bg-sky-500/10 rounded transition-all"
          title="Sync"
        >
          <RotateCcw size={18} />
          {showSynced && (
            <span className="absolute top-1 right-1 inline-block text-[8px] font-bold text-emerald-400 animate-pulse">
              ✓
            </span>
          )}
        </button>
      </div>

      <div className="text-center">
        <h1 className="font-tech text-xl font-bold text-white tracking-widest glow-text uppercase">
          Today Manager
        </h1>
        <div className="text-[10px] text-sky-400 font-bold uppercase tracking-tighter opacity-70">
          Ponte Vedra Movers Dispatch
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-right">
          <div className="text-white font-medium text-sm">{dateStr}</div>
          <div className="flex items-center justify-end space-x-2 text-emerald-400 text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
