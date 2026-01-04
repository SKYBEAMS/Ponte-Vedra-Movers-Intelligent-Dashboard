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
   EMPLOYEES
   scheduledOff:
   - true  = OFF today (yellow glow + label)
   - false = working (normal)
   ========================= */

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: "e1", name: "James Wilson", initials: "JW", hasLicense: true, phone: "(904) 555-0101", rank: 9, scheduledOff: false },
  { id: "e2", name: "Sarah Miller", initials: "SM", hasLicense: false, phone: "(904) 555-0102", rank: 7, scheduledOff: false },
  { id: "e3", name: "Mike Thompson", initials: "MT", hasLicense: true, phone: "(904) 555-0103", rank: 10, scheduledOff: false },
  { id: "e4", name: "David Lee", initials: "DL", hasLicense: true, phone: "(904) 555-0104", rank: 8, scheduledOff: false },
  { id: "e5", name: "Chris Evans", initials: "CE", hasLicense: false, phone: "(904) 555-0105", rank: 5, scheduledOff: true },
  { id: "e6", name: "Emma Watson", initials: "EW", hasLicense: false, phone: "(904) 555-0106", rank: 6, scheduledOff: false },
  { id: "e7", name: "Robert Downey", initials: "RD", hasLicense: true, phone: "(904) 555-0107", rank: 9, scheduledOff: false },
  { id: "e8", name: "Scarlett J.", initials: "SJ", hasLicense: false, phone: "(904) 555-0108", rank: 7, scheduledOff: true },
  { id: "e9", name: "Mark Ruffalo", initials: "MR", hasLicense: true, phone: "(904) 555-0109", rank: 8, scheduledOff: false },
  { id: "e10", name: "Jeremy Renner", initials: "JR", hasLicense: true, phone: "(904) 555-0110", rank: 4, scheduledOff: false },
  { id: "e11", name: "Paul Rudd", initials: "PR", hasLicense: false, phone: "(904) 555-0111", rank: 6, scheduledOff: false },
  { id: "e12", name: "Brie Larson", initials: "BL", hasLicense: true, phone: "(904) 555-0112", rank: 8, scheduledOff: false },
  { id: "e13", name: "Tom Holland", initials: "TH", hasLicense: false, phone: "(904) 555-0113", rank: 3, scheduledOff: true },
  { id: "e14", name: "Zendaya Coleman", initials: "ZC", hasLicense: true, phone: "(904) 555-0114", rank: 7, scheduledOff: false },
];

/* =========================
   TRUCKS
   ========================= */

export const INITIAL_TRUCKS: Truck[] = [
  { id: "t1", name: "Truck 1", capacity: 6, fuelLevel: 85, ready: true, crewIds: [], jobIds: [] },
  { id: "t2", name: "Truck 2", capacity: 6, fuelLevel: 92, ready: true, crewIds: [], jobIds: [] },
  { id: "t3", name: "Truck 3", capacity: 4, fuelLevel: 45, ready: false, crewIds: [], jobIds: [] },
  { id: "t4", name: "Truck 4", capacity: 6, fuelLevel: 70, ready: true, crewIds: [], jobIds: [] },
  { id: "t5", name: "Truck 5", capacity: 4, fuelLevel: 100, ready: true, crewIds: [], jobIds: [] },
  { id: "t6", name: "Truck 6", capacity: 6, fuelLevel: 25, ready: false, crewIds: [], jobIds: [] },
];

/* =========================
   JOBS
   ========================= */

export const INITIAL_JOBS: Job[] = [
  {
    id: "j1",
    time: "9:00 AM",
    customerName: "Anderson, Paul",
    customerPhone: "(904) 123-4567",
    fromTo: "Jax Bch → PV",
    flags: [JobFlag.STAIRS, JobFlag.HEAVY],
    notes: "Large mahogany desk upstairs. Narrow stairs.",
    status: JobStatus.READY,
    warning: false,
    scheduledArrival: "2026-01-03T09:00:00-05:00",
  },
  {
    id: "j2",
    time: "10:30 AM",
    customerName: "Gomez, Maria",
    customerPhone: "(904) 234-5678",
    fromTo: "Nocatee → Mandarin",
    flags: [JobFlag.STORAGE],
    notes: "Short-term storage. Fragile bins labeled.",
    status: JobStatus.READY,
    warning: false,
    scheduledArrival: "2026-01-03T10:30:00-05:00",
  },
  {
    id: "j3",
    time: "11:30–1:30",
    customerName: "Skyline Corp",
    customerPhone: "(904) 345-6789",
    fromTo: "Downtown → St. Johns",
    flags: [JobFlag.MULTI_STOP, JobFlag.HEAVY, JobFlag.MULTIPLE_TRUCKS, JobFlag.PACKING],
    notes: "Commercial office move. Confirm staging & crew size.",
    status: JobStatus.READY,
    warning: true,
    warningNote: "Packing + multiple trucks required.",
    scheduledArrival: "2026-01-03T11:30:00-05:00",
  },
  {
    id: "j4",
    time: "12:00 PM",
    customerName: "Baker Residence",
    customerPhone: "(904) 456-7890",
    fromTo: "PV → PV South",
    flags: [JobFlag.PIANO],
    notes: "Upright piano. 4-man minimum.",
    status: JobStatus.READY,
    warning: false,
    scheduledArrival: "2026-01-03T12:00:00-05:00",
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
