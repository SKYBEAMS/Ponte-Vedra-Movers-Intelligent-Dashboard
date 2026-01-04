// src/App.tsx
import React, { useState, useCallback, useMemo } from "react";
import { Users, ClipboardList, Signal, ArrowDown, Plus, CheckCircle2 } from "lucide-react";

import { Job, Truck, DragItem, JobStatus } from "./types";
import { INITIAL_EMPLOYEES, INITIAL_TRUCKS, INITIAL_JOBS } from "./constants";

import TopNav from "./components/TopNav";
import EmployeeCard from "./components/EmployeeCard";
import JobCard from "./components/JobCard";
import TruckCard from "./components/TruckCard";
import JobDetailsModal from "./components/JobDetailsModal";

import { pushHistory, popHistory } from "./utils/history";


// ✅ NEW: history snapshot type
type AppStateSnapshot = {
  trucks: Truck[];
  allJobs: Job[];
};

const cloneTrucks = (trucks: Truck[]): Truck[] =>
  trucks.map((t) => ({ ...t, crewIds: [...t.crewIds], jobIds: [...t.jobIds] }));

const cloneJobs = (jobs: Job[]): Job[] => jobs.map((j) => ({ ...j, flags: [...(j.flags || [])] }));

/** ✅ EDIT #1 helper: split legacy fromTo into two parts */
function splitFromTo(fromTo?: string) {
  const s = (fromTo || "").trim();
  if (!s) return { from: "", to: "" };

  const parts = s.split("→").map((p) => p.trim());
  if (parts.length >= 2) return { from: parts[0], to: parts.slice(1).join(" → ") };

  const dash = s.split("-").map((p) => p.trim());
  if (dash.length >= 2) return { from: dash[0], to: dash.slice(1).join(" - ") };

  return { from: s, to: "" };
}

/** ✅ EDIT #1 helper: hydrate legacy jobs so pickup/dropoff always exist */
function hydrateJobs(jobs: Job[]): Job[] {
  return jobs.map((j) => {
    if ((j.pickupAddress && j.pickupAddress.trim()) || (j.dropoffAddress && j.dropoffAddress.trim())) {
      return j;
    }
    const route = splitFromTo(j.fromTo);
    return {
      ...j,
      pickupAddress: j.pickupAddress ?? route.from ?? "",
      dropoffAddress: j.dropoffAddress ?? route.to ?? "",
    };
  });
}

export default function App() {
  const [trucks, setTrucks] = useState<Truck[]>(INITIAL_TRUCKS);

  /** ✅ EDIT #1 applied here: initial jobs are hydrated once */
  const [allJobs, setAllJobs] = useState<Job[]>(hydrateJobs(INITIAL_JOBS));

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // ✅ CHANGED: history now stores full snapshot (trucks + jobs)
  const [history, setHistory] = useState<Snapshot<AppStateSnapshot>[]>([]);

  const rosterEmployees = useMemo(() => {
    const assignedIds = new Set(trucks.flatMap((t) => t.crewIds));
    return INITIAL_EMPLOYEES.filter((e) => !assignedIds.has(e.id));
  }, [trucks]);

  const queueJobs = useMemo(() => {
    const assignedIds = new Set(trucks.flatMap((t) => t.jobIds));
    return allJobs.filter((j) => !assignedIds.has(j.id));
  }, [trucks, allJobs]);

  const saveHistory = useCallback(() => {
    setHistory((prev) =>
      pushHistory(prev, {
        trucks: cloneTrucks(trucks),
        allJobs: cloneJobs(allJobs),
      })
    );
  }, [trucks, allJobs]);

  const handleRefresh = useCallback(() => {
    setHistory([]);
    setTrucks(INITIAL_TRUCKS);

    /** ✅ EDIT #2 applied here: refresh uses hydrated jobs too */
    setAllJobs(hydrateJobs(INITIAL_JOBS));

    setSelectedJob(null);
  }, []);

  const handleUndo = useCallback(() => {
    const { nextHistory, last } = popHistory(history);
    if (!last) return;

    setTrucks(last.trucks);
    setAllJobs(last.allJobs);

    // keep modal in sync after undo (close if job disappears)
    setSelectedJob((prev) => {
      if (!prev) return null;
      const found = last.allJobs.find((j) => j.id === prev.id);
      return found ?? null;
    });

    setHistory(nextHistory);
  }, [history]);

  const handleDragStart = (
    e: React.DragEvent,
    id: string,
    type: "employee" | "job",
    sourceTruckId?: string
  ) => {
    const dragData: DragItem = { id, type, sourceTruckId };
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = "0.4";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
  };

  const handleDropOnTruck = (e: React.DragEvent, targetTruckId: string) => {
    const rawData = e.dataTransfer.getData("application/json");
    if (!rawData) return;
    const dragItem: DragItem = JSON.parse(rawData);

    if (dragItem.sourceTruckId === targetTruckId) return;

    // ✅ history should capture BEFORE the change
    saveHistory();

    setTrucks((prevTrucks) => {
      const nextTrucks = prevTrucks.map((t) => ({
        ...t,
        crewIds: [...t.crewIds],
        jobIds: [...t.jobIds],
      }));

      const target = nextTrucks.find((t) => t.id === targetTruckId);
      const source = dragItem.sourceTruckId
        ? nextTrucks.find((t) => t.id === dragItem.sourceTruckId)
        : null;

      if (!target) return prevTrucks;

      if (dragItem.type === "employee") {
        if (target.crewIds.length >= target.capacity) return prevTrucks;
        if (source) source.crewIds = source.crewIds.filter((id) => id !== dragItem.id);
        if (!target.crewIds.includes(dragItem.id)) target.crewIds.push(dragItem.id);
      } else {
        if (source) source.jobIds = source.jobIds.filter((id) => id !== dragItem.id);
        if (!target.jobIds.includes(dragItem.id)) target.jobIds.push(dragItem.id);

        // mark job ASSIGNED when placed on a truck
        setAllJobs((prev) =>
          prev.map((j) =>
            j.id === dragItem.id
              ? { ...j, status: JobStatus.ASSIGNED, assignedTruckId: targetTruckId }
              : j
          )
        );
      }

      return nextTrucks;
    });
  };

  const handleDropOnRoster = (e: React.DragEvent) => {
    const rawData = e.dataTransfer.getData("application/json");
    if (!rawData) return;
    const dragItem: DragItem = JSON.parse(rawData);

    if (dragItem.type !== "employee" || !dragItem.sourceTruckId) return;

    saveHistory();
    setTrucks((prevTrucks) =>
      prevTrucks.map((t) => {
        if (t.id === dragItem.sourceTruckId) {
          return { ...t, crewIds: t.crewIds.filter((id) => id !== dragItem.id) };
        }
        return t;
      })
    );
  };

  const handleDropOnQueue = (e: React.DragEvent) => {
    const rawData = e.dataTransfer.getData("application/json");
    if (!rawData) return;
    const dragItem: DragItem = JSON.parse(rawData);

    if (dragItem.type !== "job" || !dragItem.sourceTruckId) return;

    saveHistory();

    setTrucks((prevTrucks) =>
      prevTrucks.map((t) => {
        if (t.id === dragItem.sourceTruckId) {
          return { ...t, jobIds: t.jobIds.filter((id) => id !== dragItem.id) };
        }
        return t;
      })
    );

    // reset job back to READY + clear assignment
    setAllJobs((prev) =>
      prev.map((j) =>
        j.id === dragItem.id ? { ...j, status: JobStatus.READY, assignedTruckId: undefined } : j
      )
    );
  };

  const addJob = () => {
    saveHistory(); // ✅ so Undo removes the new job
    const newJob: Job = {
  id: `j-${Date.now()}`,
  time: "09:00 AM",
  customerName: "New Client",
  customerPhone: "(904) 000-0000",

  // ✅ start blank (truth fields)
  pickupAddress: "",
  dropoffAddress: "",

  // ✅ display label starts blank
  fromTo: "",

  flags: [],
  notes: "Please update job details.",
  status: JobStatus.READY,
  warning: true,
  warningNote: "Missing required job details.",
  scheduledArrival: new Date().toISOString(),
};

    setAllJobs((prev) => [...prev, newJob]);
    setSelectedJob(newJob); // ✅ open editor immediately
  };

  const deleteJob = (id: string) => {
    saveHistory();
    setTrucks((prev) => prev.map((t) => ({ ...t, jobIds: t.jobIds.filter((jid) => jid !== id) })));
    setAllJobs((prev) => prev.filter((j) => j.id !== id));
    setSelectedJob((prev) => (prev?.id === id ? null : prev));
  };

  const [rosterOver, setRosterOver] = useState(false);
  const [queueOver, setQueueOver] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-white tron-grid overflow-hidden relative">
      <TopNav onUndo={handleUndo} canUndo={history.length > 0} onRefresh={handleRefresh} />

      <main className="flex-1 flex overflow-hidden pt-16 p-6 space-x-6">
        {/* Left Column: Employees (Roster) */}
        <div className="w-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-tech text-xs font-bold text-sky-400 uppercase tracking-[0.2em] flex items-center">
              <Users size={16} className="mr-2" /> Crew Roster
            </h2>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
              {rosterEmployees.length} AVAILABLE
            </span>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setRosterOver(true);
            }}
            onDragLeave={() => setRosterOver(false)}
            onDrop={(e) => {
              handleDropOnRoster(e);
              setRosterOver(false);
            }}
            className={`flex-1 overflow-y-auto pr-2 no-scrollbar space-y-1 rounded-xl transition-all duration-300 ${
              rosterOver ? "bg-sky-500/5 ring-2 ring-sky-400/50 scale-[1.01]" : ""
            }`}
          >
            {rosterOver && (
              <div className="flex items-center justify-center py-4 border-2 border-dashed border-sky-400/50 rounded-xl mb-3 animate-pulse bg-sky-500/5">
                <ArrowDown size={24} className="text-sky-400" />
                <span className="ml-2 text-xs font-bold text-sky-400 uppercase">Drop to Unassign</span>
              </div>
            )}

            {rosterEmployees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </div>

        {/* Center Column: Trucks */}
        <div className="flex-1 flex flex-col space-y-6 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-3 gap-6">
            {trucks.map((truck) => (
              <TruckCard
                key={truck.id}
                truck={truck}
                crew={INITIAL_EMPLOYEES.filter((e) => truck.crewIds.includes(e.id))}
                jobs={allJobs.filter((j) => truck.jobIds.includes(j.id))}
                onDrop={handleDropOnTruck}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onViewJobDetails={setSelectedJob}
              />
            ))}
          </div>

          <div className="glass p-4 rounded-2xl border border-sky-500/20 flex items-center justify-between shadow-2xl">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span className="text-[10px] font-bold text-white/60 tracking-wider">SYSTEMS NOMINAL</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                <span className="text-[10px] font-bold text-white/60 tracking-wider">
                  {queueJobs.length} PENDING ASSIGNMENTS
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20">
              <Signal size={14} className="text-sky-400" />
              <span className="text-[10px] font-tech text-sky-400 tracking-widest">NETWORK: ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Right Column: Queue */}
        <div className="w-[320px] flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-tech text-xs font-bold text-sky-400 uppercase tracking-[0.2em] flex items-center">
              <ClipboardList size={16} className="mr-2" /> Job Queue
            </h2>
            <button
              onClick={addJob}
              className="p-1.5 bg-sky-500/10 border border-sky-500/30 rounded text-sky-400 hover:bg-sky-500 hover:text-white transition-all"
              title="Add New Job"
            >
              <Plus size={16} />
            </button>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setQueueOver(true);
            }}
            onDragLeave={() => setQueueOver(false)}
            onDrop={(e) => {
              handleDropOnQueue(e);
              setQueueOver(false);
            }}
            className={`flex-1 overflow-y-auto pr-2 no-scrollbar rounded-xl transition-all duration-300 ${
              queueOver ? "bg-sky-500/5 ring-2 ring-sky-400/50 scale-[1.01]" : ""
            }`}
          >
            {queueOver && (
              <div className="flex items-center justify-center py-4 border-2 border-dashed border-sky-400/50 rounded-xl mb-3 animate-pulse bg-sky-500/5">
                <ArrowDown size={24} className="text-sky-400" />
                <span className="ml-2 text-xs font-bold text-sky-400 uppercase">Drop to Return</span>
              </div>
            )}

            {queueJobs.length > 0 ? (
              queueJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onViewDetails={setSelectedJob}
                  onDelete={deleteJob}
                />
              ))
            ) : !queueOver ? (
              <div className="flex flex-col items-center justify-center h-40 glass rounded-2xl border border-dashed border-white/10 opacity-40">
                <CheckCircle2 size={32} className="mb-2" />
                <span className="text-xs uppercase font-bold tracking-widest">Queue Cleared</span>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50 shadow-[0_-4px_20px_rgba(14,165,233,0.5)]"></div>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          
onUpdateJob={(updatedJob) => {
  // ✅ save correct snapshot BEFORE changing jobs
  saveHistory();

  setAllJobs((prev) =>
    prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
  );

  setSelectedJob(updatedJob);
}}

        />
      )}
    </div>
  );
}