// ✅ src/components/JobCard.tsx
import React, { useMemo } from "react";
import { Clock, Info, MapPin, Trash2 } from "lucide-react";
import { Job } from "../types";
import { fromToDisplay } from "../utils/address";
import {
  evaluateJobWarnings,
  evaluateJobWarningsResult,
} from "../utils/jobwarnings";

type Props = {
  job: Job;
  compact?: boolean;
  onDragStart: (e: React.DragEvent, id: string, type: "job", sourceTruckId?: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onViewDetails: (job: Job) => void;
  onDelete?: (id: string) => void;
  sourceTruckId?: string;

  // ✅ mute/unmute warnings (wired from App.tsx)
  onToggleWarningMute?: (jobId: string) => void;
};

// Cleans old stored strings like:
// "From: 123 Main St, Jacksonville, FL To: 55 King St, St Augustine, FL"
function normalizeLegacyFromTo(fromTo?: string): string {
  const s = (fromTo ?? "").trim();
  if (!s) return "— → —";

  const cleaned = s
    .replace(/^from:\s*/i, "")
    .replace(/\s*to:\s*/i, " → ")
    .replace(/\s*-\s*>\s*/g, " → ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

// ✅ visual chip config (icons without changing the whole card color unless threshold met)
const CHIP: Record<
  string,
  { label: string; bg: string; border: string; glow: string; text: string }
> = {
  packing: {
    label: "PACK",
    bg: "bg-sky-500/10",
    border: "border-sky-400/35",
    glow: "shadow-[0_0_14px_rgba(14,165,233,0.30)]",
    text: "text-sky-200/90",
  },
  stairs: {
    label: "STAIRS",
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/35",
    glow: "shadow-[0_0_14px_rgba(16,185,129,0.28)]",
    text: "text-emerald-200/90",
  },
  piano: {
    label: "PIANO",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-400/35",
    glow: "shadow-[0_0_14px_rgba(217,70,239,0.26)]",
    text: "text-fuchsia-200/90",
  },
  "multiple-trucks": {
    label: "2+ TRK",
    bg: "bg-violet-500/10",
    border: "border-violet-400/35",
    glow: "shadow-[0_0_14px_rgba(139,92,246,0.22)]",
    text: "text-violet-200/90",
  },
  heavy: {
    label: "HEAVY",
    bg: "bg-slate-500/10",
    border: "border-slate-300/25",
    glow: "shadow-[0_0_14px_rgba(148,163,184,0.18)]",
    text: "text-slate-200/80",
  },
  "multi-stop": {
    label: "STOPS",
    bg: "bg-indigo-500/10",
    border: "border-indigo-400/35",
    glow: "shadow-[0_0_14px_rgba(99,102,241,0.20)]",
    text: "text-indigo-200/90",
  },
  storage: {
    label: "STOR",
    bg: "bg-cyan-500/10",
    border: "border-cyan-400/35",
    glow: "shadow-[0_0_14px_rgba(34,211,238,0.18)]",
    text: "text-cyan-200/90",
  },
};

export default function JobCard({
  job,
  compact = false,
  onDragStart,
  onDragEnd,
  onViewDetails,
  onDelete,
  sourceTruckId,
  onToggleWarningMute,
}: Props) {
  // ✅ normalize warnings (this returns Job w/ warning fields set)
  const j = evaluateJobWarnings(job);

  // ✅ read the detailed result so we can do "icons always, yellow only at 3+"
  const result = useMemo(() => evaluateJobWarningsResult(j), [j]);

  // ✅ Default to false (mute OFF on load)
  const isMuted = j.warningMuted ?? false;

  // HARD = red (date missing/invalid/past per your jobwarnings.ts)
  const isHard = !isMuted && (j.warningLevel === "hard" || result.level === "hard");

  // SOFT (yellow) only if 3+ soft flags AND not muted
  const softCount = result.softFlags?.length ?? 0;
  const isSoft = !isMuted && !isHard && softCount >= 3;

  // ✅ Only show mute button when there's an actual warning to mute
  const hasWarnOrCritical =
    j.warningLevel === "hard" ||
    j.warningLevel === "soft" ||
    (result.level && result.level !== "none");

  const showMuteBtn = hasWarnOrCritical;

  // ✅ we still show chips for whatever soft flags exist (even if <3)
  const chips = (result.softFlags || []).slice(0, 4); // keep tight; we can expand later

  // addresses display
  const pickup = j.pickupAddress;
  const dropoff = j.dropoffAddress;

  const hasTruthAddresses = Boolean(pickup?.trim()) || Boolean(dropoff?.trim());
  const fromToText = hasTruthAddresses
    ? fromToDisplay(pickup, dropoff)
    : normalizeLegacyFromTo((j as any).fromTo);

  // ✅ Card visuals
  const borderBgClass = isHard
    ? "border-rose-400/80 bg-rose-500/12 shadow-[0_0_26px_rgba(244,63,94,0.35)]"
    : isSoft
    ? "border-amber-400/55 bg-amber-500/8 shadow-[0_0_22px_rgba(245,158,11,0.22)]"
    : "border-sky-500/20";

  const hoverClass = isHard
    ? "hover:border-rose-300 hover:shadow-[0_0_34px_rgba(244,63,94,0.45)]"
    : isSoft
    ? "hover:border-amber-300/80 hover:shadow-[0_0_28px_rgba(245,158,11,0.28)]"
    : "hover:border-sky-400/60";

  const padClass = compact ? "p-2 mb-2" : "p-3 mb-3";

  const titleColor = isHard
    ? "text-rose-300"
    : isSoft
    ? "text-amber-300"
    : "text-sky-400";

  const infoHover = isHard
    ? "group-hover:text-rose-300"
    : isSoft
    ? "group-hover:text-amber-300"
    : "group-hover:text-sky-400";

  const displayName = (j.customerName || "").trim() ? j.customerName : "—";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, j.id, "job", sourceTruckId)}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        if (e.defaultPrevented) return;
        onViewDetails(job);
      }}
      className={`relative group glass border rounded-xl transition-all duration-300 cursor-pointer active:scale-95 ${borderBgClass} ${hoverClass} ${padClass}`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className={`flex items-center space-x-1.5 ${titleColor}`}>
          <Clock size={12} />
          <span className="text-[10px] font-bold tracking-wider">{j.time}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ Mute/Unmute warnings button (still allowed) */}
          {showMuteBtn && onToggleWarningMute && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWarningMute(j.id);
              }}
              title={j.warningMuted ? "Unmute warning highlight" : "Mute warning highlight"}
              className={[
                "absolute -top-2 right-2 z-30",
                "px-2 py-[2px] rounded-full text-[9px] font-bold uppercase tracking-widest",
                "border shadow-sm",
                j.warningMuted
                  ? "bg-slate-900 text-white border-slate-700"
                  : "bg-yellow-500/20 text-yellow-200 border-yellow-400/40 hover:bg-yellow-500/30",
              ].join(" ")}
            >
              {j.warningMuted ? "Muted" : "Mute"}
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(j.id);
              }}
              className="text-white/20 hover:text-rose-400 transition-colors p-1"
              title="Delete job"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h4 className={`text-white font-bold leading-tight ${compact ? "text-xs" : "text-sm"}`}>
          {displayName}
        </h4>
        <Info size={14} className={`text-white/20 transition-colors ${infoHover}`} />
      </div>

      <div className="flex items-center text-white/50 text-[10px] mt-1 italic">
        <MapPin size={10} className="mr-1 opacity-50" />
        {fromToText}
      </div>

      {/* ✅ Chips row (glowing indicators). Yellow card only when 3+ chips (soft flags). */}
      {chips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((f) => {
            const cfg = CHIP[f] || {
              label: f.toUpperCase().slice(0, 6),
              bg: "bg-white/5",
              border: "border-white/10",
              glow: "shadow-none",
              text: "text-white/60",
            };

            // muted = no glow
            const glow = isMuted ? "shadow-none" : cfg.glow;

            return (
              <span
                key={f}
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-widest ${cfg.bg} ${cfg.border} ${cfg.text} ${glow}`}
                title={f}
              >
                {cfg.label}
              </span>
            );
          })}

          {result.softFlags.length > chips.length && (
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-widest bg-white/5 border-white/10 text-white/55 ${
                isMuted ? "" : "shadow-[0_0_12px_rgba(255,255,255,0.08)]"
              }`}
              title={result.softFlags.join(", ")}
            >
              +{result.softFlags.length - chips.length}
            </span>
          )}
        </div>
      )}

      {/* ✅ NO "WARNING" badge anymore.
          If HARD (red), show a clear tiny reason line instead. */}
      {isHard && !isMuted && (
        <div className="mt-2 text-[10px] font-bold tracking-wider text-rose-200/90">
          {j.warningNote || "Needs review — date issue."}
        </div>
      )}

      {/* ✅ MUTED indicator */}
      {showMuteBtn && isMuted && (
        <div
          className="mt-2 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white/50"
          title="Warning visuals are muted"
        >
          MUTED
        </div>
      )}
    </div>
  );
}
