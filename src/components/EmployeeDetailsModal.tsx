// src/components/EmployeeDetailModal.tsx
import React, { useState } from "react";
import type { Employee, EmployeeNote } from "../types";

type Props = {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSetPointOfContact?: (empId: string | null) => void;
  isPointOfContact?: boolean;
  // ✅ NEW: notes and note handler
  notes?: EmployeeNote[];
  onAddNote?: (text: string) => void;
};

export default function EmployeeDetailModal({ 
  open, 
  employee, 
  onClose, 
  onSetPointOfContact, 
  isPointOfContact,
  notes,
  onAddNote,
}: Props) {
  // ✅ NEW: Note text state
  const [noteText, setNoteText] = useState("");

  if (!open || !employee) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-2xl border border-sky-500/30 shadow-2xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/20">
          <h2 className="text-lg font-bold text-sky-400 uppercase tracking-wide">
            Employee Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-white/60 hover:text-white hover:bg-red-500/20 rounded transition-all"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
          <div>
            <label className="text-[10px] font-bold text-sky-400/80 uppercase tracking-widest">
              Name
            </label>
            <p className="text-white font-semibold mt-1">{employee.name}</p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-sky-400/80 uppercase tracking-widest">
              Initials
            </label>
            <p className="text-white font-semibold mt-1">
              {employee.initials}
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-sky-400/80 uppercase tracking-widest">
              Phone
            </label>
            <p className="text-white font-semibold mt-1">
              {employee.phone || "N/A"}
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-sky-400/80 uppercase tracking-widest">
              Rank
            </label>
            <p className="text-white font-semibold mt-1">{employee.rank}</p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-sky-400/80 uppercase tracking-widest">
              CDL / License
            </label>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                employee.hasLicense
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}
            >
              {employee.hasLicense ? "HAS LICENSE" : "NO LICENSE"}
            </span>
          </div>

          <div>
            <label className="text-[10px] font-bold text-sky-400/80 uppercase tracking-widest">
              Status
            </label>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                employee.scheduledOff
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {employee.scheduledOff ? "SCHEDULED OFF" : "AVAILABLE"}
            </span>
          </div>

          {/* ✅ NEW: Notes Section */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-widest text-white/70">
                Notes
              </div>
              <div className="text-[11px] text-white/40">
                {(notes?.length ?? 0)} saved
              </div>
            </div>

            <div className="mt-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type a note about this person…"
                className="w-full min-h-[80px] rounded-lg border border-white/10 bg-black/20 p-2 text-sm text-white outline-none"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={!noteText.trim()}
                  onClick={() => {
                    const text = noteText.trim();
                    if (!text) return;
                    onAddNote?.(text);
                    setNoteText("");
                  }}
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-40"
                >
                  Save Note
                </button>

                <button
                  type="button"
                  onClick={() => setNoteText("")}
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/60 text-xs font-bold uppercase tracking-widest"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2 max-h-[220px] overflow-auto pr-1">
              {(notes ?? []).slice(0, 20).map((n) => (
                <div key={n.id} className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <div className="text-[11px] text-white/40">
                    {n.truckId ? `Truck: ${n.truckId}` : "—"}
                  </div>
                  <div className="mt-1 text-sm text-white/90">{n.text}</div>
                </div>
              ))}

              {(notes?.length ?? 0) === 0 && (
                <div className="text-sm text-white/40">No notes yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-4 border-t border-sky-500/20">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition-all uppercase text-xs tracking-wide"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onSetPointOfContact?.(employee?.id ?? null)}
            className="px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-widest"
          >
            Set Point of Contact
          </button>
          <button
            type="button"
            onClick={() => onSetPointOfContact?.(null)}
            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/60 text-xs font-bold uppercase tracking-widest"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
