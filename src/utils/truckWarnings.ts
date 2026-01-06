// ✅ src/utils/truckwarnings.ts
import type { Employee, Truck, WarningLevel } from "../types";

function hasAnyPhone(crew: Employee[]) {
  return crew.some((p) => (p.phone ?? "").trim().length > 0);
}

// ✅ NEW: Prioritize phone holders, then rank
function getLeadByRank(crew: Employee[]) {
  if (crew.length === 0) return null;

  const withPhone = crew.filter((p) => (p.phone ?? "").trim().length > 0);

  // If anyone has a phone, lead must come from that set
  const pool = withPhone.length > 0 ? withPhone : crew;

  return [...pool].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))[0];
}

export function evaluateTruckWarnings(
  truck: Truck,
  ctx: { crew: Employee[]; jobsCount: number }
): { warningLevel: WarningLevel; warningNote?: string; fuelBand: "ok" | "low" | "critical" } {
  const crew = ctx.crew ?? [];
  const active = crew.length > 0 || (ctx.jobsCount ?? 0) > 0;

  // Default fuel band for UI bars
  const fuelBand: "ok" | "low" | "critical" =
    truck.fuelLevel < 20 ? "critical" : truck.fuelLevel < 30 ? "low" : "ok";

  // If not active, keep dim/neutral — no warnings
  if (!active) {
    return { warningLevel: "none", fuelBand };
  }

  const lead = getLeadByRank(crew);

  // 🔴 HARD: fuel critical
  if (truck.fuelLevel < 20) {
    return { warningLevel: "hard", warningNote: "Fuel critical (<20%)", fuelBand };
  }

  // 🔴 HARD blockers (in play)
  if (truck.ready === false) {
    return { warningLevel: "hard", warningNote: "Truck not ready", fuelBand };
  }

  // Check-in capability: if truck is active but no phones exist at all
  if (!hasAnyPhone(crew)) {
    return { warningLevel: "hard", warningNote: "No phone for check-ins", fuelBand };
  }

  // ✅ NEW: If we have at least one phone on the truck, the LEAD must also have a phone
  // (This handles edge cases where lead selection might fallback curiously, or if data is weird)
  if (hasAnyPhone(crew) && lead && (lead.phone ?? "").trim().length === 0) {
    return { warningLevel: "hard", warningNote: "Lead has no phone (SMS handler invalid)", fuelBand };
  }

  // Lead not responding (derived from lead check-in state)
  const leadCheckInStatus = (lead as any)?.checkInStatus;
  if (lead && leadCheckInStatus === "notReplied") {
    return { warningLevel: "hard", warningNote: "Lead not responding", fuelBand };
  }

  // 🟡 SOFT: fuel low band
  if (truck.fuelLevel >= 20 && truck.fuelLevel < 30) {
    return { warningLevel: "soft", warningNote: "Fuel low", fuelBand };
  }

  return { warningLevel: "none", fuelBand };
}