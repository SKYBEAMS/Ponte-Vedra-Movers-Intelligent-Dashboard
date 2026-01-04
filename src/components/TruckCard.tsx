import React, { useMemo, useState } from "react";
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
  onDragEnd?: (e: React.DragEvent) => void; // optional so nothing breaks
  onViewJobDetails: (job: Job) => void;
};

export default function TruckCard({
  truck,
  crew,
  jobs,
  onDrop,
  onDragStart,
  onDragEnd,
  onViewJobDetails,
}: TruckCardProps) {
  const [isOver, setIsOver] = useState(false);
  const isFull = crew.length >= truck.capacity;

  // ✅ Truck yellow rules (ONLY these)
  const fuelLow = truck.fuelLevel < 30;
  const truckWarning = !truck.ready || fuelLow;

  // Lead = highest rank
  const leadEmployee = useMemo(() => {
    if (crew.length === 0) return null;
    return [...crew].sort((a, b) => b.rank - a.rank)[0];
  }, [crew]);

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

  // Base border color (normal vs warning)
  const baseBorder = truckWarning ? "border-amber-500/35" : "border-white/10";

  // When dragging over:
  // - full crew blocks (red)
  // - otherwise highlight blue
  // - if truck is already warning, keep a subtle amber influence
  const overBorder = isFull
    ? "border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]"
    : truckWarning
    ? "border-amber-400/70 shadow-[0_0_30px_rgba(245,158,11,0.18)] scale-[1.02]"
    : "border-sky-400 shadow-[0_0_30px_rgba(14,165,233,0.3)] scale-[1.02]";

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`glass border transition-all duration-300 rounded-2xl flex flex-col min-h-[220px] overflow-hidden ${
        isOver ? overBorder : baseBorder
      } ${
        truckWarning && !isOver
          ? "shadow-[0_0_18px_rgba(245,158,11,0.10)]"
          : ""
      }`}
    >
      <div className="bg-white/5 p-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-2">
          <TruckIcon
            size={18}
            className={
              truckWarning
                ? "text-amber-300"
                : truck.ready
                ? "text-sky-400"
                : "text-white/30"
            }
          />
          <h2 className="font-tech text-sm font-bold text-white uppercase tracking-wider">
            {truck.name}
          </h2>

          {/* Optional tiny warning chip */}
          {truckWarning && (
            <span className="ml-2 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-amber-400/30 bg-amber-500/10 text-amber-300">
              Warning
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-white/40 uppercase font-bold">
              Fuel
            </span>
            <div className="w-16 h-1 bg-white/10 rounded-full mt-0.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  fuelLow ? "bg-rose-500" : "bg-sky-500"
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
            {truck.ready ? (
              <CheckCircle2 size={12} />
            ) : (
              <AlertCircle size={12} />
            )}
          </div>
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
              <Users size={12} className="mr-1" /> Crew ({crew.length}/{truck.capacity})
            </h3>
          </div>

          <div
            className={`min-h-[100px] border border-dashed rounded-lg p-1.5 flex flex-wrap gap-1.5 align-content-start transition-colors ${
              isFull ? "border-rose-500/20" : "border-white/10"
            }`}
          >
            {crew.map((person) => {
              const isLead = person.id === leadEmployee?.id;

              return (
                <div
                  key={person.id}
                  draggable
                  onDragStart={(e) =>
                    onDragStart(e, person.id, "employee", truck.id)
                  }
                  onDragEnd={onDragEnd}
                  className={`group relative h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-grab active:cursor-grabbing shadow-lg shadow-sky-900/20 ${
                    isLead
                      ? "bg-sky-400 text-slate-950 border-2 border-white shadow-[0_0_15px_rgba(56,189,248,0.5)] z-10"
                      : "bg-sky-500/20 border border-sky-500/40 text-white hover:bg-sky-500 hover:border-sky-300"
                  }`}
                  title={isLead ? `Lead: ${person.name} (SMS Handler)` : person.name}
                >
                  {person.initials}
                  {isLead && (
                    <div className="absolute -bottom-1 -right-1 bg-white text-sky-600 rounded-full p-0.5 border border-sky-400 scale-75">
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
        {fuelLow && (
          <div className="flex items-center space-x-1 text-rose-400 text-[9px] font-bold whitespace-nowrap bg-rose-500/10 px-1.5 py-0.5 rounded">
            <AlertCircle size={10} />
            <span>CRITICAL FUEL</span>
          </div>
        )}

        {!truck.ready && (
          <div className="flex items-center space-x-1 text-amber-300 text-[9px] font-bold whitespace-nowrap bg-amber-500/10 px-1.5 py-0.5 rounded">
            <AlertCircle size={10} />
            <span>SUPPLIES / READY CHECK</span>
          </div>
        )}

        <div className="flex items-center space-x-1 text-sky-300 text-[9px] font-bold whitespace-nowrap bg-sky-500/10 px-1.5 py-0.5 rounded">
          <AlertCircle size={10} />
          <span>UPDATE NEEDED</span>
        </div>
      </div>
    </div>
  );
}
