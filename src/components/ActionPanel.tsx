import React from "react";

type ActionPanelProps = {
  makeStatus?: "ACTIVE" | "DOWN";
  onEtaPing: () => void;
  onSupplies: () => void;

  // keep props for now so App.tsx doesn’t break, but we won’t call them
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
  const makePill =
    makeStatus === "ACTIVE"
      ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/20"
      : "bg-red-500/10 text-red-200 border-red-400/20";

  // Outer bar (glass)
  const shell =
    "w-full rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur " +
    "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_60px_rgba(0,0,0,0.35)]";

  // Center capsule that holds primary buttons
  const capsule =
    "inline-flex items-stretch rounded-2xl border border-white/10 bg-white/[0.05] " +
    "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_0_24px_rgba(56,189,248,0.08)] overflow-hidden";

  // Primary button style (bigger target + crisp hover)
  const btn =
    "relative px-3.5 min-h-[44px] flex items-center gap-2 " +
    "text-[10px] font-black uppercase tracking-[0.22em] text-white/80 " +
    "hover:text-white hover:bg-white/8 transition-colors " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 focus-visible:ring-offset-0";

  const divider = "w-px bg-white/10";

  const badge =
    "ml-2 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 " +
    "rounded-full text-[9px] font-black bg-white/15 text-white";

  // V2 section
  const v2Header =
    "mt-2 flex items-center gap-2 w-full text-[10px] font-black uppercase tracking-widest text-white/35";
  const v2Line = "flex-1 h-px bg-white/10";

  const btnV2 =
    "px-3.5 min-h-[44px] rounded-xl border border-white/10 bg-white/[0.04] " +
    "text-[10px] font-black uppercase tracking-[0.22em] text-white/55 opacity-60 cursor-not-allowed";

  const v2Pill =
    "ml-2 inline-flex items-center justify-center px-1.5 h-[16px] rounded-full " +
    "text-[9px] font-black bg-white/10 text-white/70 border border-white/10";

  return (
    <div className={`${shell} px-3 py-2`}>
      {/* 3-col grid keeps the action capsule truly centered */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Left spacer / optional future hint text */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/35">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400/70" />
          <span>OPS READY</span>
        </div>

        {/* Center: Primary Actions (centered no matter what) */}
        <div className="flex justify-center">
          <div className={capsule}>
            <button
              className={btn}
              onClick={() => {
                console.log("ACTIONPANEL: ETA CLICK");
                onEtaPing?.();
              }}
              type="button"
              title="Request completion ETA from assigned trucks"
            >
              ETA
            </button>

            <div className={divider} />

            <button
              className={btn}
              onClick={() => {
                console.log("ACTIONPANEL: SUPPLIES CLICK");
                onSupplies?.();
              }}
              type="button"
              title="Request supplies/fuel/ready status from assigned trucks"
            >
              SUPPLIES
            </button>

            <div className={divider} />

            <button
              className={btn}
              onClick={() => {
                console.log("ACTIONPANEL: QUICK NOTES CLICK");
                onQuickNotes?.();
              }}
              type="button"
              title="Broadcast a quick crew note (current job context)"
            >
              QUICK NOTES
            </button>

            <div className={divider} />

            <button
              className={btn}
              onClick={() => {
                console.log("ACTIONPANEL: NEEDS ATTENTION CLICK");
                onNeedsAttention?.();
              }}
              type="button"
              title="Show hard warnings / needs review queue"
            >
              NEEDS ATTENTION
              {needsAttentionCount > 0 && (
                <span className={badge}>{needsAttentionCount}</span>
              )}
            </button>

            <div className={divider} />

            <button
              className={btn}
              onClick={() => {
                console.log("ACTIONPANEL: HEADS UP CLICK");
                onHeadsUp?.();
              }}
              type="button"
              title="Show soft warnings / heads up queue"
            >
              HEADS UP
              {headsUpCount > 0 && <span className={badge}>{headsUpCount}</span>}
            </button>
          </div>
        </div>

        {/* Right: Status (fixed area so center stays center) */}
        <div className="flex justify-end items-center gap-2">
          <div
            className={[
              "px-2.5 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest",
              makePill,
            ].join(" ")}
            title="Make.com status"
          >
            MAKE: {makeStatus}
          </div>

          <div
            className="px-2.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-[10px] font-black uppercase tracking-widest text-white/70"
            title="Firestore/UI sync status"
          >
            SYNCED
          </div>
        </div>
      </div>

      {/* V2 COMING SOON (clean + aligned) */}
      <div className={v2Header}>
        <span className={v2Line} />
        <span>V2 COMING SOON</span>
        <span className={v2Line} />
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button
          className={btnV2}
          type="button"
          disabled
          title="Coming soon (V2)"
          onClick={() => console.log("ACTIONPANEL: BROADCAST V2 disabled")}
        >
          BROADCAST <span className={v2Pill}>V2</span>
        </button>

        <button
          className={btnV2}
          type="button"
          disabled
          title="Coming soon (V2)"
          onClick={() => console.log("ACTIONPANEL: SEND REVIEW V2 disabled")}
        >
          SEND REVIEW <span className={v2Pill}>V2</span>
        </button>

        <button
          className={btnV2}
          type="button"
          disabled
          title="Coming soon (V2)"
          onClick={() => console.log("ACTIONPANEL: NEW JOB ASAP V2 disabled")}
        >
          NEW JOB ASAP <span className={v2Pill}>V2</span>
        </button>

        <button
          className={btnV2}
          type="button"
          disabled
          title="Coming soon (V2)"
          onClick={() => console.log("ACTIONPANEL: AI STABILIZER V2 disabled")}
        >
          AI STABILIZER <span className={v2Pill}>V2</span>
        </button>
      </div>
    </div>
  );
}
