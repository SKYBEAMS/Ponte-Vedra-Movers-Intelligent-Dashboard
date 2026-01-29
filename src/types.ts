// src/types.ts

export enum JobFlag {
  STAIRS = "stairs",
  HEAVY = "heavy",
  STORAGE = "storage",
  PIANO = "piano",
  MULTI_STOP = "multi-stop",

  // NEW
  PACKING = "packing",
  MULTIPLE_TRUCKS = "multiple-trucks",
}

/** Automation/dispatch statuses */
export enum JobStatus {
  READY = "READY",
  ASSIGNED = "ASSIGNED",
  ARRIVED = "ARRIVED",
  LOADED = "LOADED",
  COMPLETED = "COMPLETED",
  PAID = "PAID",
}

/** ✅ warning severity for routing + UI */
export type WarningLevel = "none" | "soft" | "hard";

/** ✅ employee check-in state (for SMS automations later) */
export type CheckInStatus = "ok" | "pending" | "notReplied";

export interface Employee {
  id: string;
  name: string;
  initials: string;
  hasLicense: boolean;
  phone?: string;
  rank: number;

  // if true, visually mark them as not available
  scheduledOff: boolean;

  // Optional legacy warning state (keep for compatibility)
  warning?: boolean;
  warningNote?: string;

  // ✅ structured warnings (truth)
  warningLevel?: WarningLevel;
  warningMuted?: boolean;

  // ✅ check-in tracking
  checkInStatus?: CheckInStatus;
  checkIn1SentAt?: string; // ISO
  checkIn2SentAt?: string; // ISO
  lastCheckInSentAt?: string; // ISO
  lastCheckInReplyAt?: string; // ISO
}

export type Job = {
  id: string;
  jobId?: string;

  // Core identity
  customerName: string;
  phone?: string;

  // Scheduling
  scheduledArrival: string; // ISO string (source of truth)

  // Transitional / UI convenience fields (safe to keep)
  time?: string; // e.g. "9:00 AM"
  fromTo?: string; // e.g. "Jax Bch → PV"
  customerPhone?: string; // legacy alias (we’ll remove later)

  // Locations (future real data)
  pickupAddress?: string;
  dropoffAddress?: string;

  // Notes & flags
  notes?: string;
  flags: JobFlag[];

  // State
  status: JobStatus;

  /** Existing warning fields (kept for now) */
  warning?: boolean;
  warningNote?: string;

  /** ✅ structured warning (truth) */
  warningLevel?: WarningLevel; // "hard" forces Needs Review, "soft" does not
  warningMuted?: boolean; // owner can hide the warning badge without losing data

  // Assignment
  assignedTruckId?: string;
  assignedCrewIds?: string[];
};

export interface Truck {
  id: string;
  name: string;
  capacity: number;
  fuelLevel: number;
  ready: boolean;
  jobIds: string[];

  // Optional legacy warning state (keep for compatibility)
  warning?: boolean;
  warningNote?: string;

  // ✅ NEW: structured warnings (truth)
  warningLevel?: WarningLevel;
  warningMuted?: boolean;

  // ✅ manual override for lead / point of contact
  pointOfContactId?: string | null;

  assignedEmployeeIds: string[];
  truckNumber: string;
}

/** Drag payload */
export interface DragItem {
  type: "employee" | "job";
  id: string;
  sourceTruckId?: string;
}

export type EmployeeNote = {
  id: string;
  text: string;
  createdAt: any; // Timestamp | null OK for now
  createdBy?: string | null;
  truckId?: string | null;
  tags?: string[];
  scheduleIntent?: boolean;
};
