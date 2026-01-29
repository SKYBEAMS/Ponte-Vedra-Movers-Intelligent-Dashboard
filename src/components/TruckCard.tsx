// src/components/TruckCard.tsx
import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  PhoneCall,
  Truck as TruckIcon,
  Users,
} from "lucide-react";

import type { Employee, Job, Truck } from "../types";
import JobCard from "./JobCard";
import { evaluateTruckWarnings } from "../utils/truckWarnings";

type TruckCardProps = {
  truck: Truck;
  crew: Employee[];
  jobs: Job[];
  onDrop: (e: React.DragEvent, targetTruckId: string) => void;
  onDragStart: (
    e: React.DragEvent,
    id: string,
    type: "employee" | "job",
    sourceTruckId?: string
  ) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onViewJobDetails: (job: Job) => void;
  onToggleTruckMute: (truckId: string) => void;
  onEmployeeClick?: (emp: Employee, truckId: string) => void;
  leadId?: string | null;
  contactId?: string | null;
};

export default function TruckCard({
  truck,
  crew,
  jobs,
  onDrop,
  onDragStart,
  onDragEnd,
  onViewJobDetails,
  onToggleTruckMute,
  onEmployeeClick,
  leadId = null,
  contactId = null,
}: TruckCardProps) {
  console.log("TRUCK VIEW", truck.id, {
    assignedEmployeeIds: truck.assignedEmployeeIds,
    crewResolved: crew.map((c) => c.id),
  });

  const [isOver, setIsOver] = useState(false);
  const isFull = crew.length >= truck.capacity;

  const active = crew.length > 0 || jobs.length > 0;

  // ✅ DELETED: leadEmployee useMemo block is gone.

  const warning = evaluateTruckWarnings(truck, { crew, jobsCount: jobs.length });
  const muted = truck.warningMuted === true;

  const showWarning = active && !muted && warning.warningLevel !== "none";
  const truckHard = showWarning && warning.warningLevel === "hard";
  const truckSoft = showWarning && warning.warningLevel === "soft";

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };
  const handleDragLeave = () => setIsOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(e, truck.id);
  };

  const baseBorder = showWarning
    ? truckHard
      ? "border-rose-500/45"
      : "border-amber-500/35"
    : "border-white/10";

  const baseDim = !active ? "opacity-70" : "";

  const overBorder = isFull
    ? "border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]"
    : showWarning
    ? truckHard
      ? "border-rose-400/70 shadow-[0_0_30px_rgba(244,63,94,0.18)] scale-[1.02]"
      : "border-amber-400/70 shadow-[0_0_30px_rgba(245,158,11,0.18)] scale-[1.02]"
    : "border-sky-400 shadow-[0_0_30px_rgba(14,165,233,0.3)] scale-[1.02]";

  const fuelBand = warning.fuelBand; // "ok" | "low" | "critical"

  // ✅ Show mute button only when there's an active warning to mute
  const showMuteBtn = active && warning.warningLevel !== "none";

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative group glass border transition-all duration-300 rounded-2xl flex flex-col min-h-[220px] overflow-hidden ${
        isOver ? overBorder : baseBorder
      } ${showWarning && !isOver ? "shadow-[0_0_18px_rgba(245,158,11,0.08)]" : ""} ${baseDim} ${
        truckHard ? "hover:border-red-400/70 hover:shadow-[0_0_0_1px_rgba(239,68,68,0.25),0_0_20px_rgba(239,68,68,0.18)]" : ""
      }`}
      title={showWarning && warning.warningNote ? warning.warningNote : undefined}
    >
      <div className="bg-white/5 p-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-2">
          <TruckIcon
            size={18}
            className={
              showWarning
                ? truckHard
                  ? "text-rose-300"
                  : "text-amber-300"
                : active
                ? "text-sky-400"
                : "text-white/30"
            }
          />
          <h2 className="font-tech text-sm font-bold text-white uppercase tracking-wider">
            {truck.name}
          </h2>

          {showWarning && (
            <span
              className={`ml-2 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${
                truckHard
                  ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
                  : "border-amber-400/30 bg-amber-500/10 text-amber-300"
              }`}
            >
              {truckHard ? "Needs Review" : "Warning"}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="ml-2 flex flex-col items-end">
            <span className="text-[9px] text-white/40 uppercase font-bold">
              Fuel
            </span>
            <div className="w-16 h-1 bg-white/10 rounded-full mt-0.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  fuelBand === "critical"
                    ? "bg-rose-500"
                    : fuelBand === "low"
                    ? "bg-amber-400"
                    : "bg-sky-500"
                }`}
                style={{ width: `${truck.fuelLevel}%` }}
              />
            </div>
          </div>

          <div
            className={`p-1 rounded-full ${
              truck.ready
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-rose-400 bg-rose-400/10"
            }`}
            title={truck.ready ? "Ready" : "Not ready"}
          >
            {truck.ready ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          </div>

          {showMuteBtn && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleTruckMute(truck.id);
              }}
              title="Mute/unmute truck warnings"
              className={[
                "z-[60] pointer-events-auto",
                "text-[9px] px-2 py-[2px] rounded-md border",
                "transition-all duration-150",
                truck.warningMuted
                  ? "bg-white/5 text-white/70 border-white/10"
                  : "bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30 hover:border-amber-300/70 hover:text-amber-100 hover:shadow-[0_0_0_1px_rgba(251,191,36,0.25),0_0_18px_rgba(251,191,36,0.18)]",
              ].join(" ")}
            >
              {truck.warningMuted ? "MUTED" : "MUTE"}
            </button>
          )}
        </div>
      </div>

      <div className="p-3 grid grid-cols-2 gap-3 flex-1">
        {/* Crew */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3
              className={`text-[10px] font-bold uppercase tracking-widest flex items-center ${
                isFull ? "text-rose-400" : "text-sky-400"
              }`}
            >
              <Users size={12} className="mr-1" /> Crew ({crew.length}/
              {truck.capacity})
            </h3>
          </div>

          <div
            className={`min-h-[100px] border border-dashed rounded-lg p-1.5 flex flex-wrap gap-1.5 align-content-start transition-colors ${
              isFull ? "border-rose-500/20" : "border-white/10"
            }`}
          >
            {crew.map((person) => {
              const isLead = !!leadId && person.id === leadId;

              return (
                <div
                  key={person.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, person.id, "employee", truck.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => onEmployeeClick?.(person, truck.id)}
                  className={`group relative h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-grab active:cursor-grabbing shadow-lg shadow-sky-900/20 ${
                    isLead
                      ? "bg-emerald-400 text-slate-950 border-2 border-white shadow-[0_0_15px_rgba(52,211,153,0.5)] z-10"
                      : "bg-sky-500/20 border border-sky-500/40 text-white hover:bg-sky-500 hover:border-sky-300"
                  }`}
                  title={
                    isLead
                      ? `Lead: ${person.name}`
                      : person.name
                  }
                >
                  {person.initials}

                  {/* Lead badge */}
                  {isLead && (
                    <div className="absolute -bottom-1 -right-1 bg-white text-emerald-700 rounded-full p-0.5 border border-emerald-400 scale-75">
                      <PhoneCall size={10} />
                    </div>
                  )}
                </div>
              );
            })}

            {crew.length === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/10 py-6">
                <Users size={20} className="mb-1" />
                <span className="text-[8px] uppercase tracking-tighter">
                  Assign Crew
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Jobs */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center">
            <ClipboardList size={12} className="mr-1" /> Jobs ({jobs.length})
          </h3>

          <div className="min-h-[100px] border border-dashed border-white/10 rounded-lg p-1.5">
            {jobs.map((job) => (
              <div key={job.id} className="relative group">
                <JobCard
                  job={job}
                  compact
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onViewDetails={onViewJobDetails}
                  sourceTruckId={truck.id}
                />
              </div>
            ))}

            {jobs.length === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/10 py-6">
                <ClipboardList size={20} className="mb-1" />
                <span className="text-[8px] uppercase tracking-tighter">
                  Drop Contract
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Flags */}
      <div className="bg-sky-950/20 p-2 px-3 border-t border-white/5 flex items-center space-x-3 overflow-x-auto no-scrollbar">
        {active && fuelBand === "critical" && (
          <div className="flex items-center space-x-1 text-rose-400 text-[9px] font-bold whitespace-nowrap bg-rose-500/10 px-1.5 py-0.5 rounded">
            <AlertCircle size={10} />
            <span>FUEL CRITICAL</span>
          </div>
        )}

        {active && fuelBand === "low" && (
          <div className="flex items-center space-x-1 text-amber-300 text-[9px] font-bold whitespace-nowrap bg-amber-500/10 px-1.5 py-0.5 rounded">
            <AlertCircle size={10} />
            <span>FUEL LOW</span>
          </div>
        )}

        {active && truck.ready === false && (
          <div className="flex items-center space-x-1 text-rose-300 text-[9px] font-bold whitespace-nowrap bg-rose-500/10 px-1.5 py-0.5 rounded">
            <AlertCircle size={10} />
            <span>TRUCK NOT READY</span>
          </div>
        )}

        {active && showWarning && warning.warningNote && (
          <div className="flex items-center space-x-1 text-sky-300 text-[9px] font-bold whitespace-nowrap bg-sky-500/10 px-1.5 py-0.5 rounded">
            <AlertCircle size={10} />
            <span>{warning.warningNote.toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}