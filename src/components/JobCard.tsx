import React from "react";
import { Clock, Info, MapPin, Trash2 } from "lucide-react";
import { Job } from "../types";

type Props = {
  job: Job;
  compact?: boolean;
  onDragStart: (e: React.DragEvent, id: string, type: "job", sourceTruckId?: string) => void;
  onDragEnd?: (e: React.DragEvent) => void; // optional so older calls don't break
  onViewDetails: (job: Job) => void;
  onDelete?: (id: string) => void;
  sourceTruckId?: string;
};

export default function JobCard({
  job,
  compact = false,
  onDragStart,
  onDragEnd,
  onViewDetails,
  onDelete,
  sourceTruckId,
}: Props) {
    const isWarning = job.warning === true;
    console.log("JOB:", job.customerName, "warning:", job.warning);


  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, job.id, "job", sourceTruckId)}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        if (e.defaultPrevented) return;
        onViewDetails(job);
      }}
      className={`relative group glass border border-sky-500/20 rounded-xl hover:border-sky-400/60 transition-all duration-300 cursor-pointer active:scale-95 ${
        compact ? "p-2 mb-2 bg-sky-900/10" : "p-3 mb-3"
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center space-x-1.5 text-sky-400">
          <Clock size={12} />
          <span className="text-[10px] font-bold tracking-wider">{job.time}</span>
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(job.id);
            }}
            className="text-white/20 hover:text-rose-400 transition-colors p-1"
            title="Delete job"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center">
        <h4 className={`text-white font-bold leading-tight ${compact ? "text-xs" : "text-sm"}`}>
          {job.customerName}
        </h4>
        <Info size={14} className="text-white/20 group-hover:text-sky-400 transition-colors" />
      </div>

      <div className="flex items-center text-white/50 text-[10px] mt-1 italic">
        <MapPin size={10} className="mr-1 opacity-50" />
        {job.fromTo}
      </div>
    </div>
  );
}
