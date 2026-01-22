import React from "react";

type ActionPanelProps = {
  makeStatus?: "ACTIVE" | "DOWN";
  onEtaPing: () => void;
  onSupplies: () => void;
  onBroadcast: () => void;
  onNewJob: () => void;
  onNeedsAttention: () => void;
  onHeadsUp: () => void;
  onQuickNotes: () => void;
};

export default function ActionPanel({
  makeStatus = "ACTIVE",
  onEtaPing,
  onSupplies,
  onBroadcast,
  onNewJob,
  onNeedsAttention,
  onHeadsUp,
  onQuickNotes,
}: ActionPanelProps) {
  const pill =
    makeStatus === "ACTIVE"
      ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/20"
      : "bg-red-500/10 text-red-200 border-red-400/20";

  const btn =
    "px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/10 transition-all";

  return (
    <div className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-white/10 bg-white/5">
      {/* Left: Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button className={btn} onClick={onEtaPing} type="button">
          ETA PING
        </button>
        <button className={btn} onClick={onSupplies} type="button">
          SUPPLIES
        </button>
        <button className={btn} onClick={onBroadcast} type="button">
          BROADCAST
        </button>
        <button className={btn} onClick={onNewJob} type="button">
          NEW JOB
        </button>
        <button className={btn} onClick={onNeedsAttention} type="button">
          NEEDS ATTENTION
        </button>
        <button className={btn} onClick={onHeadsUp} type="button">
          HEADS UP
        </button>
        <button className={btn} onClick={onQuickNotes} type="button">
          QUICK NOTES
        </button>
      </div>

      {/* Right: Status */}
      <div className="flex items-center gap-2">
        <div
          className={[
            "px-2 py-1 rounded-lg border text-[10px] font-bold tracking-widest",
            pill,
          ].join(" ")}
        >
          MAKE: {makeStatus}
        </div>
        <div className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold tracking-widest text-white/70">
          SYNCED
        </div>
      </div>
    </div>
  );
}
