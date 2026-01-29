import React from "react";
import type { Truck, Employee, Job } from "./types";
import { JobFlag, JobStatus } from "./types";
import {
  ArrowUpCircle,
  Weight,
  Box,
  Music,
  MapPin,
  Truck as TruckIcon,
} from "lucide-react";

/* =========================
   JOB STATUS DISPLAY + ORDER
   ========================= */

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  [JobStatus.READY]: "Ready",
  [JobStatus.ASSIGNED]: "Assigned",
  [JobStatus.ARRIVED]: "Arrived",
  [JobStatus.LOADED]: "Loaded",
  [JobStatus.COMPLETED]: "Completed",
  [JobStatus.PAID]: "Paid",
};

export const JOB_STATUS_ORDER: JobStatus[] = [
  JobStatus.READY,
  JobStatus.ASSIGNED,
  JobStatus.ARRIVED,
  JobStatus.LOADED,
  JobStatus.COMPLETED,
  JobStatus.PAID,
];

/* =========================
   EMPLOYEES (Scenario-driven)
   - Some phones missing -> phone icon NOT green
   - Some scheduledOff true (should glow/label)
   - One lead notReplied (truck should go RED "Lead not responding")
   ========================= */

export const INITIAL_EMPLOYEES: Employee[] = [
  // ✅ good phone (green)
  {
    id: "e1",
    name: "James Wilson",
    initials: "JW",
    hasLicense: true,
    phone: "(904) 555-0101",
    rank: 9,
    scheduledOff: false,
    checkInStatus: "ok",
  },

  // ❌ no phone (icon NOT green)
  {
    id: "e2",
    name: "Sarah Miller",
    initials: "SM",
    hasLicense: false,
    phone: "",
    rank: 7,
    scheduledOff: false,
  },

  // ✅ lead w/ phone but NOT REPLIED (truck goes RED when he’s lead)
  {
    id: "e3",
    name: "Mike Thompson",
    initials: "MT",
    hasLicense: true,
    phone: "(904) 555-0103",
    rank: 10, // highest rank = lead
    scheduledOff: false,
    checkInStatus: "notReplied",
    checkIn1SentAt: "2026-01-06T09:00:00-05:00",
    checkIn2SentAt: "2026-01-06T09:10:00-05:00",
  },

  // ✅ phone
  {
    id: "e4",
    name: "David Lee",
    initials: "DL",
    hasLicense: true,
    phone: "(904) 555-0104",
    rank: 8,
    scheduledOff: false,
  },

  // ✅ scheduled off (if assigned, should be RED on employee warnings; also should show Scheduled Off label)
  {
    id: "e5",
    name: "Chris Evans",
    initials: "CE",
    hasLicense: false,
    phone: "(904) 555-0105",
    rank: 5,
    scheduledOff: true,
  },

  // ❌ phone missing (undefined)
  {
    id: "e6",
    name: "Emma Watson",
    initials: "EW",
    hasLicense: false,
    // phone omitted intentionally
    rank: 6,
    scheduledOff: false,
  },

  // ✅ extra normal employees (kept so roster feels real)
  {
    id: "e7",
    name: "Robert Downey",
    initials: "RD",
    hasLicense: true,
    phone: "(904) 555-0107",
    rank: 9,
    scheduledOff: false,
  },
  {
    id: "e8",
    name: "Scarlett J.",
    initials: "SJ",
    hasLicense: false,
    phone: "(904) 555-0108",
    rank: 7,
    scheduledOff: false, // ✅ fresh screen: only ONE scheduled off
  },
  {
    id: "e9",
    name: "Mark Ruffalo",
    initials: "MR",
    hasLicense: true,
    phone: "(904) 555-0109",
    rank: 8,
    scheduledOff: false,
  },
  {
    id: "e10",
    name: "Jeremy Renner",
    initials: "JR",
    hasLicense: true,
    phone: "(904) 555-0110",
    rank: 4,
    scheduledOff: false,
  },
  {
    id: "e11",
    name: "Paul Rudd",
    initials: "PR",
    hasLicense: false,
    phone: "(904) 555-0111",
    rank: 6,
    scheduledOff: false,
  },
  {
    id: "e12",
    name: "Brie Larson",
    initials: "BL",
    hasLicense: true,
    phone: "(904) 555-0112",
    rank: 8,
    scheduledOff: false,
  },
  {
    id: "e13",
    name: "Tom Holland",
    initials: "TH",
    hasLicense: false,
    phone: "",
    rank: 3,
    scheduledOff: false, // ✅ fresh screen: only ONE scheduled off
  },
  {
    id: "e14",
    name: "Zendaya Coleman",
    initials: "ZC",
    hasLicense: true,
    phone: "(904) 555-0114",
    rank: 7,
    scheduledOff: false,
  },
];

/* =========================
   TRUCKS (Scenario-driven)
   - One truck at 5% fuel (RED)
   - One truck at 25% fuel (YELLOW)
   - One truck inactive (dim/neutral)
   - One truck active but NO phone available (RED "No phone for check-ins")
   - One truck active + ready false (RED "Truck not ready")
   - One truck active + lead notReplied (RED "Lead not responding")
   ========================= */

export const INITIAL_TRUCKS: Truck[] = [
  // 🔴 Fuel critical (<20)
  {
    id: "t1",
    name: "Truck 1",
    truckNumber: "1",
    capacity: 6,
    fuelLevel: 5,
    ready: true,
    assignedEmployeeIds: [],
    jobIds: [],
  },

  // 🟢 healthy
  {
    id: "t2",
    name: "Truck 2",
    truckNumber: "2",
    capacity: 6,
    fuelLevel: 65,
    ready: true,
    assignedEmployeeIds: [],
    jobIds: [],
  },

  // 🟢 Inactive (dim/neutral)
  {
    id: "t3",
    name: "Truck 3",
    truckNumber: "3",
    capacity: 4,
    fuelLevel: 80,
    ready: true,
    assignedEmployeeIds: [],
    jobIds: [],
  },

  // 🟢 healthy
  {
    id: "t4",
    name: "Truck 4",
    truckNumber: "4",
    capacity: 6,
    fuelLevel: 70,
    ready: true, // ✅ fresh screen: no “not ready” red
    assignedEmployeeIds: [],
    jobIds: [],
  },

  // 🟢 healthy
  {
    id: "t5",
    name: "Truck 5",
    truckNumber: "5",
    capacity: 4,
    fuelLevel: 90,
    ready: true,
    assignedEmployeeIds: [], // ✅ fresh screen
    jobIds: [],  // ✅ fresh screen
  },

  // Extra truck stays around (neutral-ish) for visual balance
  {
    id: "t6",
    name: "Truck 6",
    truckNumber: "6",
    capacity: 6,
    fuelLevel: 55,
    ready: true,
    assignedEmployeeIds: [],
    jobIds: [],
  },
];

/* =========================
   JOBS (Queue test pack)
   Today is Jan 6, 2026 (America/New_York)

   We want:
   - Today Queue (Jan 6): 2 jobs (1 clean, 1 soft warning)
   - Waiting Queue (Jan 7/8): 2 jobs (1 clean, 1 soft warning)
   - Needs Review: 2 jobs
       • one missing customerName (hard)
       • one past date (Jan 5 or Jan 4) (hard)
   ========================= */

export const INITIAL_JOBS: Job[] = [
  /* -------------------------
     TODAY QUEUE (Jan 6)
     ------------------------- */

  // Clean today job (no flags) — fresh/blank intake
  {
    id: "j_today_clean",
    time: "",
    customerName: "",
    customerPhone: "",
    fromTo: "",
    pickupAddress: "",
    dropoffAddress: "",
    flags: [],
    notes: "",
    status: JobStatus.READY,
    scheduledArrival: "2026-01-06T09:00:00-05:00",
  },

  // Soft warning today job (>= 3 flags) — fresh/blank intake
  {
    id: "j_today_warn",
    time: "",
    customerName: "",
    customerPhone: "",
    fromTo: "",
    pickupAddress: "",
    dropoffAddress: "",
    flags: [],
    notes: "",
    status: JobStatus.READY,
    warningNote: "",
    scheduledArrival: "2026-01-06T11:30:00-05:00",
  },

  /* -------------------------
     WAITING QUEUE (Future)
     ------------------------- */

  // Clean waiting job (Jan 7) — fresh/blank intake
  {
    id: "j_wait_clean",
    time: "",
    customerName: "",
    customerPhone: "",
    fromTo: "",
    pickupAddress: "",
    dropoffAddress: "",
    flags: [],
    notes: "",
    status: JobStatus.READY,
    scheduledArrival: "2026-01-07T10:00:00-05:00",
  },

  // Soft warning waiting job (Jan 8) — fresh/blank intake
  {
    id: "j_wait_warn",
    time: "",
    customerName: "",
    customerPhone: "",
    fromTo: "",
    pickupAddress: "",
    dropoffAddress: "",
    flags: [],
    notes: "",
    status: JobStatus.READY,
    warningNote: "",
    scheduledArrival: "2026-01-08T13:00:00-05:00",
  },

  /* -------------------------
     NEEDS REVIEW (Hard)
     ------------------------- */

  // Needs review: missing name (hard) — keep as blank fresh intake
  {
    id: "j_review_missing_name",
    time: "",
    customerName: "",
    customerPhone: "",
    fromTo: "",
    pickupAddress: "",
    dropoffAddress: "",
    flags: [],
    notes: "",
    status: JobStatus.READY,
    warningNote: "",
    scheduledArrival: "2026-01-06T15:00:00-05:00",
  },

  // Needs review: past date (hard) — keep as blank fresh intake
  {
    id: "j_review_past_date",
    time: "",
    customerName: "",
    customerPhone: "",
    fromTo: "",
    pickupAddress: "",
    dropoffAddress: "",
    flags: [],
    notes: "",
    status: JobStatus.READY,
    warningNote: "",
    scheduledArrival: "2026-01-05T09:00:00-05:00",
  },
];

/* =========================
   FLAG ICONS (NO INLINE SVG)
   ========================= */

export const FLAG_ICONS: Record<JobFlag, React.ReactNode> = {
  [JobFlag.STAIRS]: <ArrowUpCircle size={14} className="text-sky-400" />,
  [JobFlag.HEAVY]: <Weight size={14} className="text-orange-400" />,
  [JobFlag.STORAGE]: <Box size={14} className="text-blue-400" />,
  [JobFlag.PIANO]: <Music size={14} className="text-purple-400" />,
  [JobFlag.MULTI_STOP]: <MapPin size={14} className="text-emerald-400" />,
  [JobFlag.PACKING]: <Box size={14} className="text-amber-400" />,
  [JobFlag.MULTIPLE_TRUCKS]: (
    <TruckIcon size={14} className="text-amber-400" />
  ),
};
