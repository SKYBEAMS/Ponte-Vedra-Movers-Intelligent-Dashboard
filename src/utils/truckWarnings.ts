// ✅ src/utils/truckWarnings.ts

import type { Truck, Employee } from "../types";

type WarningLevel = "none" | "soft" | "hard";

type EvaluateArgs = {
  crew: Employee[];
  jobsCount: number;
  isActive?: boolean; // if you already pass this, keep it
};

type TruckWarningResult = {
  warningLevel: WarningLevel;
  warningNote?: string;
};

export function evaluateTruckWarnings(truck: Truck, args: EvaluateArgs): TruckWarningResult {
  const { crew, jobsCount } = args;

  // If your app defines "active" differently, keep your existing rule.
  // The key is: if it's active, it should enforce phone/lead check-in rules.
  const isActive = typeof args.isActive === "boolean" ? args.isActive : jobsCount > 0 || (crew?.length ?? 0) > 0;

  const hardReasons: string[] = [];
  const softReasons: string[] = [];

  // --- HARD rules ---
  if (isActive && truck.ready === false) {
    hardReasons.push("TRUCK NOT READY");
  }

  if (typeof truck.fuelLevel === "number" && truck.fuelLevel < 20) {
    hardReasons.push("FUEL CRITICAL (<20%)");
  }

  // Phone capability: if active truck and nobody has a real phone
  if (isActive) {
    const hasAnyPhone = crew.some((e) => typeof e.phone === "string" && e.phone.trim().length > 0);
    if (!hasAnyPhone) {
      hardReasons.push("NO PHONE FOR CHECK-INS");
    }
  }

  // Lead not responding (keep your rule; this is safe + additive)
  if (isActive) {
    const lead = [...crew]
      .filter((e) => typeof e.phone === "string" && e.phone.trim().length > 0) // lead must be contactable
      .sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))[0];

    if (lead?.checkInStatus === "notReplied") {
      hardReasons.push("LEAD NOT RESPONDING");
    }
  }

  // --- SOFT rules ---
  if (typeof truck.fuelLevel === "number" && truck.fuelLevel >= 20 && truck.fuelLevel <= 29) {
    softReasons.push("FUEL LOW (20–29%)");
  }

  // Decide level
  const warningLevel: WarningLevel =
    hardReasons.length > 0 ? "hard" : softReasons.length > 0 ? "soft" : "none";

  // ✅ KEY CHANGE: include *all* reasons in the note so nothing gets masked
  const warningNote =
    warningLevel === "hard"
      ? hardReasons.join(" • ")
      : warningLevel === "soft"
        ? softReasons.join(" • ")
        : undefined;

  return { warningLevel, warningNote };
}
