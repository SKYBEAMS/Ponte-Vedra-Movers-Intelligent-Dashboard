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
  NEW = "new",
  NEEDS_INFO = "needs_info",
  READY = "ready",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELED = "canceled",
}

export interface Employee {
  id: string;
  name: string;
  initials: string;
  hasLicense: boolean;
  phone: string;
  rank: number;

  // NEW: if true, visually mark them as not available (X / strike-through)
  noDayOff: boolean;

  // Optional: quick UI warning state (turn yellow)
  warning?: boolean;
  warningNote?: string;
}

export interface Job {
  id: string;

  // Human display (keep your existing UI working)
  time: string;
  customerName: string;
  customerPhone: string;
  fromTo: string;
  flags: JobFlag[];
  notes: string;

  // Automation-ready fields
  status: JobStatus;

  // If true, the contract should display as yellow warning (UI can glow)
  warning: boolean;
  warningNote?: string;

  // Scheduling (needed for “1 hour after scheduled arrival” check-ins)
  scheduledArrival: string; // ISO string

  // Assignment + routing (optional for now)
  assignedTruckId?: string;
  assignedCrewLeadId?: string;
  jobOrderForTruck?: number;

  // Live ops / ETA intelligence (optional for now)
  estimatedFinishTime?: string; // ISO string
  lastCrewUpdateAt?: string; // ISO string
}

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
