// src/App.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  Users,
  ClipboardList,
  Signal,
  ArrowDown,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Job, Truck, DragItem, JobStatus } from "./types";
import { INITIAL_EMPLOYEES, INITIAL_TRUCKS, INITIAL_JOBS } from "./constants";

import TopNav from "./components/TopNav";
import EmployeeCard from "./components/EmployeeCard";
import JobCard from "./components/JobCard";
import TruckCard from "./components/TruckCard";
import JobDetailsModal from "./components/JobDetailsModal";

import { pushHistory, popHistory } from "./utils/history";
import {
  evaluateJobWarnings,
  evaluateJobWarningsResult,
} from "./utils/jobwarnings";

// ✅ history snapshot type
type AppStateSnapshot = {
  trucks: Truck[];
  allJobs: Job[];
};

const cloneTrucks = (trucks: Truck[]): Truck[] =>
  trucks.map((t) => ({ ...t, crewIds: [...t.crewIds], jobIds: [...t.jobIds] }));

const cloneJobs = (jobs: Job[]): Job[] =>
  jobs.map((j) => ({ ...j, flags: [...(j.flags || [])] }));

/** ✅ helper: split legacy fromTo into two parts */
function splitFromTo(fromTo?: string) {
  const s = (fromTo || "").trim();
  if (!s) return { from: "", to: "" };

  const parts = s.split("→").map((p) => p.trim());
  if (parts.length >= 2) return { from: parts[0], to: parts.slice(1).join(" → ") };

  const dash = s.split("-").map((p) => p.trim());
  if (dash.length >= 2) return { from: dash[0], to: dash.slice(1).join(" - ") };

  return { from: s, to: "" };
}

/** ✅ helper: hydrate legacy jobs so pickup/dropoff always exist */
function hydrateJobs(jobs: Job[]): Job[] {
  return jobs.map((j) => {
    const hasTruth =
      (j.pickupAddress && j.pickupAddress.trim()) ||
      (j.dropoffAddress && j.dropoffAddress.trim());

    if (hasTruth) return j;

    const route = splitFromTo(j.fromTo);
    return {
      ...j,
      pickupAddress: j.pickupAddress ?? route.from ?? "",
      dropoffAddress: j.dropoffAddress ?? route.to ?? "",
    };
  });
}

// ✅ Date helpers for Today/Waiting routing
function startOfDayMs(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
function safeDateMs(iso?: string): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return startOfDayMs(d);
}

export default function App() {
  const [trucks, setTrucks] = useState<Truck[]>(INITIAL_TRUCKS);

  /** ✅ initial jobs hydrated once + warnings stamped once */
  const [allJobs, setAllJobs] = useState<Job[]>(
    hydrateJobs(INITIAL_JOBS).map(evaluateJobWarnings)
  );

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // ✅ history stores full snapshot (trucks + jobs)
  // @ts-ignore
  const [history, setHistory] = useState<any[]>([]);

  const rosterEmployees = useMemo(() => {
    const assignedIds = new Set(trucks.flatMap((t) => t.crewIds));
    return INITIAL_EMPLOYEES.filter((e) => !assignedIds.has(e.id));
  }, [trucks]);

  // ✅ assigned job IDs (jobs already on trucks)
  const assignedJobIds = useMemo(() => {
    return new Set(trucks.flatMap((t) => t.jobIds));
  }, [trucks]);

  // ✅ all unassigned jobs (the only ones eligible for queues)
  const unassignedJobs = useMemo(() => {
    return allJobs.filter((j) => !assignedJobIds.has(j.id));
  }, [allJobs, assignedJobIds]);

  // NOTE: queueJobs is still computed and left intact for safety/compat
  const queueJobs = useMemo(() => {
    const assignedIds = new Set(trucks.flatMap((t) => t.jobIds));
    return allJobs.filter((j) => !assignedIds.has(j.id));
  }, [trucks, allJobs]);

  // ✅ TRUE Needs Review: use ONE evaluator (hard == needs review)
  const needsReviewJobs = useMemo(() => {
    return unassignedJobs.filter((j) => evaluateJobWarningsResult(j).level === "hard");
  }, [unassignedJobs]);

  const needsReviewIds = useMemo(() => {
    return new Set(needsReviewJobs.map((j) => j.id));
  }, [needsReviewJobs]);

  // ✅ Today Queue (exclude Needs Review)
  const todayQueueJobs = useMemo(() => {
    const todayMs = startOfDayMs(new Date());

    return unassignedJobs.filter((j) => {
      if (needsReviewIds.has(j.id)) return false;
      const dayMs = safeDateMs(j.scheduledArrival);
      return dayMs !== null && dayMs === todayMs;
    });
  }, [unassignedJobs, needsReviewIds]);

  // ✅ Waiting Queue (exclude Needs Review)
  const waitingQueueJobs = useMemo(() => {
    const todayMs = startOfDayMs(new Date());

    return unassignedJobs.filter((j) => {
      if (needsReviewIds.has(j.id)) return false;
      const dayMs = safeDateMs(j.scheduledArrival);
      return dayMs !== null && dayMs > todayMs;
    });
  }, [unassignedJobs, needsReviewIds]);

  const saveHistory = useCallback(() => {
    setHistory((prev) =>
      pushHistory(prev, {
        trucks: cloneTrucks(trucks),
        allJobs: cloneJobs(allJobs),
      } as AppStateSnapshot)
    );
  }, [trucks, allJobs]);

  const handleRefresh = useCallback(() => {
    setHistory([]);
    setTrucks(INITIAL_TRUCKS);
    setAllJobs(hydrateJobs(INITIAL_JOBS).map(evaluateJobWarnings));
    setSelectedJob(null);
  }, []);

  const handleUndo = useCallback(() => {
    const { nextHistory, last } = popHistory(history);
    if (!last) return;

    const snapshot = last.trucks && last.allJobs ? last : last?.state ?? last;
    if (!snapshot) return;

    setTrucks(snapshot.trucks);
    setAllJobs(snapshot.allJobs);

    setSelectedJob((prev) => {
      if (!prev) return null;
      const found = snapshot.allJobs.find((j: Job) => j.id === prev.id);
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

  // ✅ Tim can mute/unmute warnings per-job (does NOT change bucket logic)
  const toggleJobWarningMute = useCallback((jobId: string) => {
    setAllJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, warningMuted: !j.warningMuted } : j))
    );
  }, []);

  const handleDropOnTruck = (e: React.DragEvent, targetTruckId: string) => {
    const rawData = e.dataTransfer.getData("application/json");
    if (!rawData) return;
    const dragItem: DragItem = JSON.parse(rawData);

    if (dragItem.sourceTruckId === targetTruckId) return;

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

        setAllJobs((prev) =>
          prev.map((j) =>
            j.id === dragItem.id
              ? evaluateJobWarnings({
                  ...j,
                  status: JobStatus.ASSIGNED,
                  assignedTruckId: targetTruckId,
                })
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

    setAllJobs((prev) =>
      prev.map((j) =>
        j.id === dragItem.id
          ? evaluateJobWarnings({ ...j, status: JobStatus.READY, assignedTruckId: undefined })
          : j
      )
    );
  };

  const addJob = () => {
    saveHistory();

    const baseNewJob: Job = {
      id: `j-${Date.now()}`,
      time: "09:00 AM",
      customerName: "",
      customerPhone: "",

      pickupAddress: "",
      dropoffAddress: "",
      fromTo: "",

      flags: [],
      notes: "Please update job details.",
      status: JobStatus.READY,
      scheduledArrival: new Date().toISOString(),

      // keep fields present so UI never freaks out
      warning: false,
      warningLevel: "none",
    };

    const newJob = evaluateJobWarnings(baseNewJob);
    setAllJobs((prev) => [...prev, newJob]);
    setSelectedJob(newJob);
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
                  {todayQueueJobs.length} PENDING ASSIGNMENTS
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

            {/* ✅ Needs Review */}
            <div className="mb-3">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-bold text-amber-300/90 tracking-widest uppercase flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-300/90" />
                  Needs Review
                </span>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                  {needsReviewJobs.length}
                </span>
              </div>

              {needsReviewJobs.length > 0 ? (
                needsReviewJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onViewDetails={setSelectedJob}
                    onDelete={deleteJob}
                    onToggleWarningMute={toggleJobWarningMute}
                  />
                ))
              ) : (
                <div className="text-[10px] text-white/40 px-2">No review items.</div>
              )}
            </div>

            {/* ✅ Today Queue */}
            <div className="mb-3">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Today Queue</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                  {todayQueueJobs.length}
                </span>
              </div>

              {todayQueueJobs.length > 0 ? (
                todayQueueJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onViewDetails={setSelectedJob}
                    onDelete={deleteJob}
                    onToggleWarningMute={toggleJobWarningMute}
                  />
                ))
              ) : !queueOver ? (
                <div className="flex flex-col items-center justify-center h-24 glass rounded-2xl border border-dashed border-white/10 opacity-40 mx-1">
                  <CheckCircle2 size={24} className="mb-2" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Today Clear</span>
                </div>
              ) : null}
            </div>

            {/* ✅ Waiting Queue */}
            <div className="mt-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Waiting Queue</span>
                <span className="text-[10px] bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded border border-sky-500/20">
                  {waitingQueueJobs.length}
                </span>
              </div>

              {waitingQueueJobs.length > 0
                ? waitingQueueJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onViewDetails={setSelectedJob}
                      onDelete={deleteJob}
                      onToggleWarningMute={toggleJobWarningMute}
                    />
                  ))
                : null}
            </div>

            {/* NOTE: queueJobs is still computed above and left intact for safety */}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50 shadow-[0_-4px_20px_rgba(14,165,233,0.5)]"></div>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdateJob={(updatedJob) => {
            saveHistory();

            // ✅ CENTRAL truth: stamp warnings before saving
            const finalJob = evaluateJobWarnings(updatedJob);

            setAllJobs((prev) => prev.map((j) => (j.id === finalJob.id ? finalJob : j)));
            setSelectedJob(finalJob);
          }}
        />
      )}
    </div>
  );
}
