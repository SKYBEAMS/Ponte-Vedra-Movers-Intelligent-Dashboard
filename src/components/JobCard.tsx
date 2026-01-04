// ✅ src/components/JobCard.tsx
import React from "react";
import { Clock, Info, MapPin, Trash2 } from "lucide-react";
import { Job, JobFlag } from "../types";
import { fromToDisplay } from "../utils/address";

type Props = {
  job: Job;
  compact?: boolean;
  onDragStart: (e: React.DragEvent, id: string, type: "job", sourceTruckId?: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onViewDetails: (job: Job) => void;
  onDelete?: (id: string) => void;
  sourceTruckId?: string;

  // ✅ NEW: mute/unmute warnings (wired from App.tsx)
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

/**
 * ✅ REQUIRED LINE + FUNCTION:
 * evaluateJobWarnings(job): Job
 *
 * We use this for DISPLAY-SIDE warning evaluation only.
 * It does NOT change buckets (App.tsx is the bucket truth), it only helps visual warnings.
 */
function evaluateJobWarnings(job: Job): Job {
  // ---- helpers (local, display-only) ----
  const startOfDayMs = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const safeDateMs = (iso?: string): number | null => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return startOfDayMs(d);
  };

  const hasCriticalFieldProblems = (j: Job): boolean => {
    const nameOk = !!j.customerName?.trim();
    const phoneOk = !!(j.customerPhone ?? j.phone ?? "").trim();
    const pickupOk = !!j.pickupAddress?.trim();
    const dropoffOk = !!j.dropoffAddress?.trim();
    const dateOk = safeDateMs(j.scheduledArrival) !== null;
    return !(nameOk && phoneOk && pickupOk && dropoffOk && dateOk);
  };

  const isPastDate = (j: Job): boolean => {
    const dayMs = safeDateMs(j.scheduledArrival);
    if (dayMs === null) return true; // unreadable/missing date => hard
    const todayMs = startOfDayMs(new Date());
    return dayMs < todayMs;
  };

  // ---- if muted, don't change anything (user choice) ----
  if (job.warningMuted) return job;

  // ---- HARD rules (RED) ----
  const critical = hasCriticalFieldProblems(job);
  const past = isPastDate(job);

  if (critical || past) {
    // force hard for display
    return {
      ...job,
      warning: true,
      warningLevel: "hard",
      warningNote:
        job.warningNote ||
        (past
          ? "Past/invalid date — needs confirmation."
          : "Missing required fields (name/phone/addresses/date)."),
    };
  }

  // ---- Respect explicit hard set by automation/back-end ----
  const existingLevel = job.warningLevel ?? (job.warning ? "soft" : "none");
  if (existingLevel === "hard") return job;

  // ---- SOFT warning flags (YELLOW) ----
  const flags = job.flags || [];
  const softFlagSet = new Set<JobFlag>([
    JobFlag.PIANO,
    JobFlag.PACKING,
    JobFlag.MULTIPLE_TRUCKS,
    JobFlag.HEAVY,
    JobFlag.STAIRS,
    JobFlag.MULTI_STOP,
    JobFlag.STORAGE,
  ]);

  const softMatches = flags.filter((f) => softFlagSet.has(f));

  // If we already have warning data, keep it (don’t overwrite)
  if (existingLevel !== "none" || job.warning) return job;

  if (softMatches.length > 0) {
    const label =
      softMatches.length === 1
        ? `${softMatches[0]}`
        : `${softMatches[0]} +${softMatches.length - 1}`;

    return {
      ...job,
      warning: true,
      warningLevel: "soft",
      warningNote: `Heads up: ${label}`,
    };
  }

  return job;
}

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
  // ✅ evaluate warnings for visual display (does NOT mutate app state)
  const j = evaluateJobWarnings(job);

  // ✅ Warning logic (dim vs bright + mute support)
  const warningLevel = j.warningLevel ?? (j.warning ? "soft" : "none"); // fallback safety
  const hasWarning = warningLevel !== "none" || !!j.warning;

  const isMuted = !!j.warningMuted;
  const showWarningVisual = hasWarning && !isMuted;

  const isHard = showWarningVisual && warningLevel === "hard";
  const isSoft = showWarningVisual && !isHard;

  // ✅ derive from truth fields when available
  const pickup = j.pickupAddress;
  const dropoff = j.dropoffAddress;

  const hasTruthAddresses = Boolean(pickup?.trim()) || Boolean(dropoff?.trim());
  const fromToText = hasTruthAddresses
    ? fromToDisplay(pickup, dropoff)
    : normalizeLegacyFromTo((j as any).fromTo);

  // ✅ IMPORTANT CHANGE:
  // Hard (critical) = RED
  // Soft warnings = YELLOW
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

  const badgeText = isHard ? "NEEDS REVIEW" : "WARNING";

  // ✅ IMPORTANT CHANGE: header accent follows hard vs soft
  const titleColor = isHard ? "text-rose-300" : showWarningVisual ? "text-amber-300" : "text-sky-400";
  const infoHover = isHard ? "group-hover:text-rose-300" : showWarningVisual ? "group-hover:text-amber-300" : "group-hover:text-sky-400";

  const displayName = (j.customerName || "").trim() ? j.customerName : "—";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, j.id, "job", sourceTruckId)}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        if (e.defaultPrevented) return;
        onViewDetails(job); // open modal with real job ref
      }}
      className={`relative group glass border rounded-xl transition-all duration-300 cursor-pointer active:scale-95 ${borderBgClass} ${hoverClass} ${padClass}`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className={`flex items-center space-x-1.5 ${titleColor}`}>
          <Clock size={12} />
          <span className="text-[10px] font-bold tracking-wider">{j.time}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ Mute/Unmute warnings button */}
          {hasWarning && onToggleWarningMute && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWarningMute(j.id);
              }}
              className="text-[10px] px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              title={j.warningMuted ? "Unmute warning highlight" : "Mute warning highlight"}
            >
              {j.warningMuted ? "Unmute" : "Mute"}
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

      {/* ✅ BADGES */}
      {showWarningVisual && (
        <div
          className={`mt-2 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-widest ${
            isHard
              ? "border-rose-400/55 bg-rose-500/16 text-rose-200"
              : "border-amber-400/35 bg-amber-500/10 text-amber-300/90"
          }`}
          title={j.warningNote || ""}
        >
          {badgeText}
        </div>
      )}

      {/* ✅ MUTED indicator (so Tim knows it’s muted) */}
      {hasWarning && isMuted && (
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
