import React from "react";
import { Clock, Info, MapPin, Trash2 } from "lucide-react";
import { Job } from "../types";
import { fromToDisplay } from "../utils/address";

type Props = {
  job: Job;
  compact?: boolean;
  onDragStart: (e: React.DragEvent, id: string, type: "job", sourceTruckId?: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onViewDetails: (job: Job) => void;
  onDelete?: (id: string) => void;
  sourceTruckId?: string;
};

// Cleans old stored strings like:
// "From: 123 Main St, Jacksonville, FL To: 55 King St, St Augustine, FL"
function normalizeLegacyFromTo(fromTo?: string): string {
  const s = (fromTo ?? "").trim();
  if (!s) return "— → —";

  // Remove leading labels if they exist
  const cleaned = s
    .replace(/^from:\s*/i, "")
    .replace(/\s*to:\s*/i, " → ")
    .replace(/\s*-\s*>\s*/g, " → ")
    .replace(/\s+/g, " ")
    .trim();

  // If it still doesn't contain an arrow, leave it as-is
  return cleaned.includes("→") ? cleaned : cleaned;
}

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

  // ✅ NEW: derive from truth fields when available
  const pickup = (job as any).pickupAddress as string | undefined;
  const dropoff = (job as any).dropoffAddress as string | undefined;

  const hasTruthAddresses = Boolean(pickup?.trim()) || Boolean(dropoff?.trim());

  const fromToText = hasTruthAddresses
    ? fromToDisplay(pickup, dropoff)
    : normalizeLegacyFromTo((job as any).fromTo);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, job.id, "job", sourceTruckId)}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        if (e.defaultPrevented) return;
        onViewDetails(job);
      }}
      className={`relative group glass border rounded-xl transition-all duration-300 cursor-pointer active:scale-95 ${
        isWarning
          ? "border-amber-400/70 bg-amber-500/10 shadow-[0_0_22px_rgba(245,158,11,0.25)]"
          : "border-sky-500/20"
      } ${
        isWarning
          ? "hover:border-amber-300 hover:shadow-[0_0_28px_rgba(245,158,11,0.35)]"
          : "hover:border-sky-400/60"
      } ${compact ? "p-2 mb-2" : "p-3 mb-3"}`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className={`flex items-center space-x-1.5 ${isWarning ? "text-amber-300" : "text-sky-400"}`}>
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
        <Info
          size={14}
          className={`text-white/20 transition-colors ${
            isWarning ? "group-hover:text-amber-300" : "group-hover:text-sky-400"
          }`}
        />
      </div>

      <div className="flex items-center text-white/50 text-[10px] mt-1 italic">
  <MapPin size={10} className="mr-1 opacity-50" />
  {fromToDisplay(job.pickupAddress, job.dropoffAddress)}
</div>

      {isWarning && (
        <div className="mt-2 inline-flex items-center rounded-md border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-amber-300">
          WARNING
        </div>
      )}
    </div>
  );
}
