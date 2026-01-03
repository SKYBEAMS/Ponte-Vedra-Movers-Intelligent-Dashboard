import React from "react";
import { Phone, ShieldCheck, Star } from "lucide-react";
import type { Employee } from "../types";

type Props = {
  employee: Employee;
  onDragStart: (
    e: React.DragEvent,
    id: string,
    type: "employee",
    sourceTruckId?: string
  ) => void;
  onDragEnd?: (e: React.DragEvent) => void; // NEW (optional so older calls don't break)
  sourceTruckId?: string;
};

export default function EmployeeCard({
  employee,
  onDragStart,
  onDragEnd,
  sourceTruckId,
}: Props) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, employee.id, "employee", sourceTruckId)}
      onDragEnd={onDragEnd} // NEW
      className="group relative mb-3 p-3 glass border border-white/10 rounded-xl hover:border-sky-400/50 hover:shadow-[0_0_15px_rgba(14,165,233,0.15)] transition-all duration-300 cursor-grab active:cursor-grabbing active:scale-95"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm border border-white/20 shadow-inner">
          {employee.initials}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm group-hover:text-sky-300 transition-colors">
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
              <Phone size={10} />
              <span>{employee.phone}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
