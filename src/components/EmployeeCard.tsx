import React from "react";
import { Phone, ShieldCheck, Star } from "lucide-react";
import type { Employee } from "../types";
import { evaluateEmployeeWarnings } from "../utils/employeeWarnings";

type Props = {
  employee: Employee;
  onDragStart: (
    e: React.DragEvent,
    id: string,
    type: "employee",
    sourceTruckId?: string
  ) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  sourceTruckId?: string;
  onClick?: () => void;
};

export default function EmployeeCard({
  employee,
  onDragStart,
  onDragEnd,
  sourceTruckId,
  onClick,
}: Props) {
  const isScheduledOff = employee.scheduledOff === true;
  const isAssigned = !!sourceTruckId; // if it came from a truck list, it's assigned

  const { warningLevel, warningNote } = evaluateEmployeeWarnings(employee, {
    isAssigned,
  });

  const muted = employee.warningMuted === true;
  const showWarning = !muted && warningLevel !== "none";

  const hasPhone = (employee.phone ?? "").trim().length > 0;
  const checkInStatus = (employee as any)?.checkInStatus as
    | "ok"
    | "pending"
    | "notReplied"
    | undefined;

  const borderClass = showWarning
    ? warningLevel === "hard"
      ? "border-rose-500/50 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
      : "border-amber-400/50 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.20)]"
    : isScheduledOff
    ? "border-amber-400/50 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
    : "border-white/10 hover:border-sky-400/50 hover:shadow-[0_0_15px_rgba(14,165,233,0.15)]";

  const cursorClass = isScheduledOff
    ? "cursor-not-allowed opacity-80"
    : "cursor-grab active:cursor-grabbing active:scale-95";

  return (
    <div
      draggable={!isScheduledOff}
      onDragStart={(e) => {
        if (isScheduledOff) return;
        onDragStart(e, employee.id, "employee", sourceTruckId);
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group relative mb-3 p-3 glass border rounded-xl transition-all duration-300 ${borderClass} ${cursorClass}`}
      title={showWarning && warningNote ? warningNote : undefined}
    >
      {/* Top-right badge */}
      {isScheduledOff && (
        <div className="absolute -top-2 right-2 text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-black px-2 py-0.5 rounded shadow">
          Scheduled Off
        </div>
      )}

      {showWarning && !isScheduledOff && (
        <div
          className={`absolute -top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow ${
            warningLevel === "hard"
              ? "bg-rose-500 text-white"
              : "bg-amber-500 text-black"
          }`}
        >
          {warningLevel === "hard" ? "Needs Review" : "Warning"}
        </div>
      )}

      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shadow-inner ${
            isScheduledOff
              ? "bg-amber-400 text-black border-amber-300"
              : showWarning && warningLevel === "hard"
              ? "bg-rose-500 text-white border-rose-300/40"
              : "bg-gradient-to-br from-sky-500 to-blue-700 text-white border-white/20"
          }`}
        >
          {employee.initials}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3
              className={`font-semibold text-sm ${
                isScheduledOff
                  ? "text-amber-200"
                  : showWarning && warningLevel === "hard"
                  ? "text-rose-200"
                  : "text-white group-hover:text-sky-300"
              }`}
            >
              {employee.name}
            </h3>

            <div className="flex items-center space-x-1 bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-500/30">
              <Star size={10} className="text-sky-400 fill-sky-400" />
              <span className="text-[10px] font-bold text-sky-300">
                {employee.rank}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-1">
            <span
              className={`text-[10px] flex items-center space-x-1 font-bold ${
                employee.hasLicense ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              <ShieldCheck size={10} />
              <span>{employee.hasLicense ? "CDL" : "NO LIC"}</span>
            </span>

            <span className="text-[10px] text-white/40 flex items-center space-x-1">
              <Phone
                size={10}
                className={hasPhone ? "text-emerald-400" : "text-white/30"}
              />
              <span className={hasPhone ? "text-emerald-300" : "text-white/40"}>
                {hasPhone ? employee.phone : "No phone"}
              </span>
            </span>

            {/* Optional: show check-in status tiny */}
            {isAssigned && checkInStatus === "notReplied" && (
              <span className="text-[10px] text-rose-300 font-bold">
                NO CHECK-IN
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
