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
  needsAttentionCount?: number;
  headsUpCount?: number;
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
  needsAttentionCount = 0,
  headsUpCount = 0,
}: ActionPanelProps) {
  const pill =
    makeStatus === "ACTIVE"
      ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/20"
      : "bg-red-500/10 text-red-200 border-red-400/20";

  const btn =
    "px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/10 transition-all";

  const badge =
    "ml-2 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-black bg-white/15 text-white";

  return (
    <div className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-white/10 bg-white/5">
      {/* Left: Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          className={btn}
          onClick={() => {
            console.log("ACTIONPANEL: ETA CLICK");
            onEtaPing?.();
          }}
          type="button"
        >
          ETA PING
        </button>
        <button
          className={btn}
          onClick={() => {
            console.log("ACTIONPANEL: SUPPLIES CLICK");
            onSupplies?.();
          }}
          type="button"
        >
          SUPPLIES
        </button>
        <button
          className={btn}
          onClick={() => {
            console.log("ACTIONPANEL: BROADCAST CLICK");
            onBroadcast?.();
          }}
          type="button"
        >
          BROADCAST
        </button>
        <button
          className={btn}
          onClick={() => {
            console.log("ACTIONPANEL: NEW JOB CLICK");
            onNewJob?.();
          }}
          type="button"
        >
          NEW JOB
        </button>
        <button className={btn} onClick={onNeedsAttention} type="button">
          NEEDS ATTENTION
          {needsAttentionCount > 0 && (
            <span className={badge}>{needsAttentionCount}</span>
          )}
        </button>
        <button className={btn} onClick={onHeadsUp} type="button">
          HEADS UP
          {headsUpCount > 0 && <span className={badge}>{headsUpCount}</span>}
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
