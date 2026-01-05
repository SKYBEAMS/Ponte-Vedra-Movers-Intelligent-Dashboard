// ✅ src/utils/jobwarnings.ts
import { Job, JobStatus } from "../types";

export type WarningLevel = "none" | "soft" | "hard";

export type JobWarningResult = {
  level: WarningLevel;
  reasons: string[];   // hard reasons
  softFlags: string[]; // flags that cause soft warnings
  hasHard: boolean;
  hasSoft: boolean;
};

// -------------------------
// Helpers
// -------------------------
function startOfDayMs(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function safeDateMs(iso?: string): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return startOfDayMs(d);
}

function isTerminal(job: Job): boolean {
  return job.status === JobStatus.COMPLETED || job.status === JobStatus.PAID;
}

function normalizeFlag(f: any): string {
  return String(f ?? "").trim().toLowerCase();
}

/**
 * Critical fields for dispatch safety.
 * Missing/invalid => HARD.
 */
function criticalFieldCheck(job: Job): { ok: boolean; missing: string[] } {
  const missing: string[] = [];

  const nameOk = !!job.customerName?.trim();
  if (!nameOk) missing.push("missing customer name");

  const phone = (job.customerPhone ?? (job as any).phone ?? "").trim();
  const phoneOk = !!phone;
  if (!phoneOk) missing.push("missing customer phone");

  const pickupOk = !!job.pickupAddress?.trim();
  if (!pickupOk) missing.push("missing pickup address");

  const dropoffOk = !!job.dropoffAddress?.trim();
  if (!dropoffOk) missing.push("missing dropoff address");

  const dateOk = safeDateMs(job.scheduledArrival) !== null;
  if (!dateOk) missing.push("missing/invalid scheduled date");

  return { ok: nameOk && phoneOk && pickupOk && dropoffOk && dateOk, missing };
}

function isPastDate(job: Job): boolean {
  const dayMs = safeDateMs(job.scheduledArrival);
  if (dayMs === null) return true; // invalid/missing treated as bad
  const todayMs = startOfDayMs(new Date());
  return dayMs < todayMs;
}

// Soft flags we recognize
const SOFT_FLAG_SET = new Set<string>([
  "piano",
  "packing",
  "multiple-trucks",
  "heavy",
  "stairs",
  "multi-stop",
  "storage",
]);

// ✅ NEW: you only want the card to go yellow when 3+ soft flags exist
const SOFT_THRESHOLD = 3;

// -------------------------
// Main evaluation (RESULT)
// -------------------------
export function evaluateJobWarningsResult(job: Job): JobWarningResult {
  if (isTerminal(job)) {
    return { level: "none", reasons: [], softFlags: [], hasHard: false, hasSoft: false };
  }

  const reasons: string[] = [];

  const crit = criticalFieldCheck(job);
  if (!crit.ok) reasons.push(...crit.missing);

  if (isPastDate(job)) reasons.push("scheduled date is in the past");

  const flags = (job.flags || []).map(normalizeFlag);
  const softFlags = flags.filter((f) => SOFT_FLAG_SET.has(f));

  const hasHard = reasons.length > 0;
  const hasSoft = !hasHard && softFlags.length >= SOFT_THRESHOLD;

  const level: WarningLevel = hasHard ? "hard" : hasSoft ? "soft" : "none";

  return { level, reasons, softFlags, hasHard, hasSoft };
}

// -------------------------
// Main evaluation (JOB)
// -------------------------
export function evaluateJobWarnings(job: Job): Job {
  // If user muted, we keep visuals muted but still keep truth updated
  const muted = !!job.warningMuted;

  const result = evaluateJobWarningsResult(job);

  // ✅ None => clear
  if (result.level === "none") {
    return {
      ...job,
      warning: false,
      warningLevel: "none",
      warningNote: undefined,
      // keep warningMuted as-is
      warningMuted: muted,
    };
  }

  // ✅ Hard => needs review
  if (result.level === "hard") {
    let note = "Needs review.";
    if (result.reasons.includes("scheduled date is in the past")) {
      note = "Past/invalid date — needs confirmation.";
    } else if (result.reasons.length > 0) {
      note = "Missing required job details (name/phone/addresses/date).";
    }

    return {
      ...job,
      warning: true,
      warningLevel: "hard",
      warningNote: note,
      warningMuted: muted,
    };
  }

  // ✅ Soft (3+ flags)
  const list = result.softFlags.slice(0, 3).join(", ");
  const note = `Heads up: ${list}${result.softFlags.length > 3 ? " +" + (result.softFlags.length - 3) : ""}`;

  return {
    ...job,
    warning: true,
    warningLevel: "soft",
    warningNote: note,
    warningMuted: muted,
  };
}
