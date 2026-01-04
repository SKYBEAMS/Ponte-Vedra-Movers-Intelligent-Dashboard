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


export interface Employee {
  id: string;
  name: string;
  initials: string;
  hasLicense: boolean;
  phone: string;
  rank: number;

  // NEW: if true, visually mark them as not available (X / strike-through)
  ScheduledOff: boolean;

  // Optional: quick UI warning state (turn yellow)
  warning?: boolean;
  warningNote?: string;
}

export type Job = {
  id: string;

  // Core identity
  customerName: string;
  phone?: string;

  // Scheduling
  scheduledArrival: string; // ISO string (source of truth)

  // Transitional / UI convenience fields (safe to keep)
  time?: string;            // e.g. "9:00 AM"
  fromTo?: string;          // e.g. "Jax Bch → PV"
  customerPhone?: string;   // legacy alias (we’ll remove later)

  // Locations (future real data)
  pickupAddress?: string;
  dropoffAddress?: string;

  // Notes & flags
  notes?: string;
  flags: JobFlag[];

  // State
  status: JobStatus;
  warning: boolean;
  warningNote?: string;

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
  crewIds: string[];
  jobIds: string[];

  // Optional: quick UI warning state (turn yellow)
  warning?: boolean;
  warningNote?: string;
}

/** Drag payload */
export interface DragItem {
  type: "employee" | "job";
  id: string;
  sourceTruckId?: string;
}
