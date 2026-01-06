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
    scheduledOff: true,
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
    scheduledOff: true,
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
  // 🔴 Fuel critical (<20) + lead notReplied
  {
    id: "t1",
    name: "Truck 1",
    capacity: 6,
    fuelLevel: 5,
    ready: true,
    crewIds: ["e3", "e4"], // e3 is lead (rank 10, notReplied)
    jobIds: ["j_today_warn"],
  },

  // 🟡 Fuel low (20–29)
  {
    id: "t2",
    name: "Truck 2",
    capacity: 6,
    fuelLevel: 25,
    ready: true,
    crewIds: ["e1", "e2"], // has at least one phone (e1)
    jobIds: ["j_today_clean"],
  },

  // 🟢 Inactive (dim/neutral)
  {
    id: "t3",
    name: "Truck 3",
    capacity: 4,
    fuelLevel: 80,
    ready: true,
    crewIds: [],
    jobIds: [],
  },

  // 🔴 Active but not ready
  {
    id: "t4",
    name: "Truck 4",
    capacity: 6,
    fuelLevel: 70,
    ready: false,
    crewIds: ["e7"],
    jobIds: ["j_wait_clean"],
  },

  // 🔴 Active but nobody has a phone (forces "No phone for check-ins")
  {
    id: "t5",
    name: "Truck 5",
    capacity: 4,
    fuelLevel: 90,
    ready: true,
    crewIds: ["e2", "e6"], // e2 phone="" and e6 phone missing
    jobIds: ["j_wait_warn"],
  },

  // Extra truck stays around (neutral-ish) for visual balance
  {
    id: "t6",
    name: "Truck 6",
    capacity: 6,
    fuelLevel: 55,
    ready: true,
    crewIds: [],
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

  // Clean today job (no flags)
  {
    id: "j_today_clean",
    time: "9:00 AM",
    customerName: "Anderson, Paul",
    customerPhone: "(904) 123-4567",
    fromTo: "Jax Bch → PV",
    pickupAddress: "123 Beach Blvd, Jacksonville Beach, FL",
    dropoffAddress: "77 A1A N, Ponte Vedra Beach, FL",
    flags: [],
    notes: "Standard move. Confirm gate code if needed.",
    status: JobStatus.READY,
    scheduledArrival: "2026-01-06T09:00:00-05:00",
  },

  // Soft warning today job (>= 3 flags)
  {
    id: "j_today_warn",
    time: "11:30 AM",
    customerName: "Skyline Corp",
    customerPhone: "(904) 345-6789",
    fromTo: "Downtown → St. Johns",
    pickupAddress: "10 W Bay St, Jacksonville, FL",
    dropoffAddress: "200 County Rd 210 W, St. Johns, FL",
    flags: [JobFlag.STAIRS, JobFlag.HEAVY, JobFlag.PACKING],
    notes: "Commercial office move. Confirm staging & crew size.",
    status: JobStatus.READY,
    warningNote: "Multiple flags (soft warning).",
    scheduledArrival: "2026-01-06T11:30:00-05:00",
  },

  /* -------------------------
     WAITING QUEUE (Future)
     ------------------------- */

  // Clean waiting job (Jan 7)
  {
    id: "j_wait_clean",
    time: "10:00 AM",
    customerName: "Baker Residence",
    customerPhone: "(904) 456-7890",
    fromTo: "PV → PV South",
    pickupAddress: "900 Marsh Landing Pkwy, Ponte Vedra Beach, FL",
    dropoffAddress: "1200 S Ponte Vedra Blvd, Ponte Vedra Beach, FL",
    flags: [],
    notes: "Future-day move. Should sit in Waiting Queue.",
    status: JobStatus.READY,
    scheduledArrival: "2026-01-07T10:00:00-05:00",
  },

  // Soft warning waiting job (Jan 8)
  {
    id: "j_wait_warn",
    time: "1:00 PM",
    customerName: "Gomez, Lisa",
    customerPhone: "(904) 777-1212",
    fromTo: "San Marco → Southside",
    pickupAddress: "1900 Hendricks Ave, Jacksonville, FL",
    dropoffAddress: "10200 San Jose Blvd, Jacksonville, FL",
    flags: [JobFlag.MULTI_STOP, JobFlag.PACKING, JobFlag.MULTIPLE_TRUCKS],
    notes: "Complex move: multi-stop + packing + multiple trucks.",
    status: JobStatus.READY,
    warningNote: "Complex move (soft warning).",
    scheduledArrival: "2026-01-08T13:00:00-05:00",
  },

  /* -------------------------
     NEEDS REVIEW (Hard)
     ------------------------- */

  // Needs review: missing name (hard)
  {
    id: "j_review_missing_name",
    time: "3:00 PM",
    customerName: "", // 🔴 critical missing
    customerPhone: "(904) 234-5678",
    fromTo: "Nocatee → Mandarin",
    pickupAddress: "100 Nocatee Center Way, Ponte Vedra, FL",
    dropoffAddress: "1234 Mandarin Rd, Jacksonville, FL",
    flags: [JobFlag.STORAGE],
    notes: "Should route to Needs Review because name is missing.",
    status: JobStatus.READY,
    warningNote: "Missing customer name (hard).",
    scheduledArrival: "2026-01-06T15:00:00-05:00",
  },

  // Needs review: past date (hard) — Jan 5
  {
    id: "j_review_past_date",
    time: "9:00 AM",
    customerName: "Past Date Client",
    customerPhone: "(904) 222-2222",
    fromTo: "Jax → Orange Park",
    pickupAddress: "1 Old Rd, Jacksonville, FL",
    dropoffAddress: "99 Old Rd, Orange Park, FL",
    flags: [],
    notes: "Past-date job should be forced into Needs Review.",
    status: JobStatus.READY,
    warningNote: "Past scheduled date (hard).",
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
  [JobFlag.MULTIPLE_TRUCKS]: <TruckIcon size={14} className="text-amber-400" />,
};
