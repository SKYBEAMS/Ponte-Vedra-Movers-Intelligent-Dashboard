// src/components/TruckCard.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Truck as TruckIcon } from "lucide-react";

import type { Employee, Job, Truck } from "../types";
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
  onFuelUpdate?: (truckId: string, fuelLevel: number) => void;
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
  onFuelUpdate,
  leadId = null,
  contactId = null,
}: TruckCardProps) {
  console.log("TRUCK VIEW", truck.id, {
    assignedEmployeeIds: truck.assignedEmployeeIds,
    crewResolved: crew.map((c) => c.id),
  });

  const [isOver, setIsOver] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isSuppliesModalOpen, setIsSuppliesModalOpen] = useState(false);

  const [fuelDraft, setFuelDraft] = useState<number>(truck.fuelLevel ?? 0);

  // supplies: numeric only (for now)
  const supplyDefaults: Record<string, number> = {
    "Moving pads": 0,
    Dollies: 0,
    Straps: 0,
    "Shrink wrap": 0,
    Tape: 0,
    Tools: 0,
    "Bungee cords": 0,
    "Floor runners": 0,
  };
  const [suppliesDraft, setSuppliesDraft] = useState<Record<string, number>>(
    supplyDefaults
  );

  const isFull = crew.length >= truck.capacity;
  const active = crew.length > 0 || jobs.length > 0;

  const warning = evaluateTruckWarnings(truck, { crew, jobsCount: jobs.length });
  const muted = truck.warningMuted === true;

  const showWarning = active && !muted && warning.warningLevel !== "none";
  const truckHard = showWarning && warning.warningLevel === "hard";

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
      ? "border-rose-400/70 shadow-[0_0_30px_rgba(244,63,94,0.18)] scale-[1.01]"
      : "border-amber-400/70 shadow-[0_0_30px_rgba(245,158,11,0.18)] scale-[1.01]"
    : "border-sky-400 shadow-[0_0_30px_rgba(14,165,233,0.25)] scale-[1.01]";

  const showMuteBtn = active && warning.warningLevel !== "none";

  // compact UI classes
  const block = "rounded-xl border border-white/10 bg-white/[0.03] p-2 min-w-0";
  const headerLabel =
    "text-[9px] font-black uppercase tracking-widest text-white/45";
  const editBtn =
    "px-2 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-[9px] font-black uppercase tracking-widest text-white/55 hover:text-white hover:bg-white/[0.06]";
  const scrollArea = "max-h-[300px] overflow-y-auto pr-1";

  const chipBase =
    "px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-[0.18em] " +
    "bg-white/[0.03] text-white/70 border-white/10 flex items-center gap-2";
  const chipLead =
    "bg-emerald-500/10 text-emerald-200 border-emerald-400/25 shadow-[0_0_12px_rgba(16,185,129,0.16)]";
  const dotBase = "w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0";
  const dotLead = "bg-emerald-400";

  const phoneIcon = (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      className="opacity-80 flex-shrink-0"
    >
      <path
        fill="currentColor"
        d="M6.6 10.8c1.5 2.9 3.7 5.2 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2c1 .4 2 .6 3.1.6c.7 0 1.3.6 1.3 1.3V20c0 .7-.6 1.3-1.3 1.3C10.1 21.3 2.7 13.9 2.7 4.1C2.7 3.6 3.3 3 4 3h3.2c.7 0 1.3.6 1.3 1.3c0 1.1.2 2.1.6 3.1c.1.4.1.9-.2 1.2L6.6 10.8z"
      />
    </svg>
  );

  // ===== Modal styling helpers =====
  const modalOverlay =
    "fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4";
  const modalShell =
    "w-full max-w-[560px] rounded-2xl border border-white/10 bg-[#0b1220] shadow-[0_18px_70px_rgba(0,0,0,0.55)] overflow-hidden";
  const modalShellWide =
    "w-full max-w-[760px] rounded-2xl border border-white/10 bg-[#0b1220] shadow-[0_18px_70px_rgba(0,0,0,0.55)] overflow-hidden";
  const modalHeader =
    "flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03] relative";
  const modalTitle =
    "text-[12px] font-black uppercase tracking-widest text-white/85 truncate";
  const modalBody = "p-4";
  const modalCloseBtn =
    "px-2 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-white/70 hover:bg-white/[0.06] hover:text-white";
  const modalPrimaryBtn =
    "px-3 py-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest text-emerald-200 hover:bg-emerald-500/15";
  const modalGhostBtn =
    "px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-white/75 hover:bg-white/[0.06]";
  const modalLabel =
    "text-[10px] font-black uppercase tracking-widest text-white/55";
  const modalHint =
    "text-[10px] font-black uppercase tracking-widest text-white/40";
  const modalInput =
    "w-16 text-right rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white/80 outline-none focus:border-sky-400/40";

  // ===== JOB UI helpers (uses existing fields: flags, warning, warningLevel) =====
  const getJobTime = (job: Job) => {
    const j: any = job;
    return j.time ?? j.startTime ?? j.scheduledTime ?? j.timeLabel ?? "";
  };

  const getJobCustomer = (job: Job) => {
    const j: any = job;
    const fallback = `${j.firstName ?? ""} ${j.lastName ?? ""}`.trim();
    return j.customerName ?? j.name ?? fallback ?? "JOB";
  };

  const getJobFlags = (job: Job): string[] => {
    const j: any = job;
    const arr = j.flags;
    if (Array.isArray(arr)) {
      return arr.map((x: any) => String(x).trim()).filter(Boolean);
    }
    return [];
  };

  const getJobNotes = (job: Job) => {
    const j: any = job;
    return j.notes ?? "";
  };

  const getJobWarningLevel = (job: Job): "none" | "soft" | "hard" => {
    const j: any = job;
    const wl = (j.warningLevel ?? "none") as string;
    if (wl === "hard" || wl === "soft") return wl;
    return "none";
  };

  const getJobWarningText = (job: Job) => {
    const j: any = job;
    return j.warning ?? "";
  };

  const jobBoxBase =
    "w-full rounded-xl border px-2 py-2 text-left transition-all duration-150";
  const jobBoxSoft =
    "border-amber-400/25 bg-amber-500/[0.06] hover:bg-amber-500/[0.10] hover:border-amber-300/60";
  const jobBoxHard =
    "border-rose-400/25 bg-rose-500/[0.06] hover:bg-rose-500/[0.10] hover:border-rose-300/60";
  const jobBoxNone =
    "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20";

  const flagPillBase =
    "px-2 py-0.5 rounded-lg border text-[7px] font-black uppercase tracking-widest transition-all duration-150";
  const flagSoft =
    "border-amber-400/25 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 hover:border-amber-300/60";
  const flagHard =
    "border-rose-400/25 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:border-rose-300/60";
  const flagNeutral =
    "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.06] hover:border-white/20";

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative group glass border transition-all duration-300 rounded-2xl flex flex-col overflow-hidden self-start ${
        isOver ? overBorder : baseBorder
      } ${
        showWarning && !isOver
          ? "shadow-[0_0_18px_rgba(245,158,11,0.08)]"
          : ""
      } ${baseDim}`}
      title={showWarning && warning.warningNote ? warning.warningNote : undefined}
    >
      {/* Header with truck name (centered) and status */}
      <div className="bg-white/5 p-1 flex items-center justify-center border-b border-white/5 relative">
        <div className="flex items-center justify-center space-x-2">
          <TruckIcon
            size={16}
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
          <h2 className="font-tech text-xs font-bold text-white uppercase tracking-widest">
            {truck.name}
          </h2>

          <div
            className={`p-0.5 rounded-full ${
              truck.ready
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-rose-400 bg-rose-400/10"
            }`}
            title={truck.ready ? "Ready" : "Not ready"}
          >
            {truck.ready ? (
              <CheckCircle2 size={10} />
            ) : (
              <AlertCircle size={10} />
            )}
          </div>

          {showWarning && (
            <span
              className={`ml-1 text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded border ${
                truckHard
                  ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
                  : "border-amber-400/30 bg-amber-500/10 text-amber-300"
              }`}
            >
              {truckHard ? "Needs Review" : "Warning"}
            </span>
          )}
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
              "absolute top-0.5 right-0.5",
              "z-[60] pointer-events-auto",
              "text-[7px] px-1 py-0.5 rounded border",
              "transition-all duration-150",
              truck.warningMuted
                ? "bg-white/5 text-white/70 border-white/10"
                : "bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30 hover:border-amber-300/70 hover:text-amber-100",
            ].join(" ")}
          >
            {truck.warningMuted ? "M" : "MUTE"}
          </button>
        )}
      </div>

      {/* MAIN BODY */}
      <div className="px-2 py-1 flex flex-col gap-1.5">
        {/* Fuel and Supplies row (side by side, compact) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Fuel button */}
          <button
            type="button"
            onClick={() => {
              setFuelDraft(truck.fuelLevel ?? 0);
              setIsFuelModalOpen(true);
            }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-0.5 text-left hover:bg-white/[0.06] transition-colors"
            title="Edit fuel"
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="text-[7px] font-black uppercase tracking-widest text-white/45">
                Fuel
              </div>
              <div className="text-[7px] font-black uppercase tracking-widest text-white/55">
                Edit
              </div>
            </div>

            <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-cyan-300/60"
                style={{ width: `${truck.fuelLevel ?? 0}%` }}
              />
            </div>

            <div className="mt-0.5 text-[7px] font-black uppercase tracking-widest text-white/60">
              {truck.fuelLevel ?? 0}%
            </div>
          </button>

          {/* Supplies button */}
          <button
            type="button"
            onClick={() => {
              setSuppliesDraft((prev) => ({ ...supplyDefaults, ...prev }));
              setIsSuppliesModalOpen(true);
            }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-0.5 text-left hover:bg-white/[0.06] transition-colors"
            title="View/Edit supplies"
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="text-[7px] font-black uppercase tracking-widest text-white/45">
                Supplies
              </div>
              <div className="text-[7px] font-black uppercase tracking-widest text-white/55">
                Edit
              </div>
            </div>

            {truck.ready && (
              <div className="inline-flex items-center gap-1 px-1 py-0.5 rounded-lg border border-emerald-400/25 bg-emerald-500/10 text-emerald-200 text-[6px] font-black uppercase tracking-widest">
                <span className="w-0.5 h-0.5 rounded-full bg-emerald-400" />
                Prepped
              </div>
            )}
          </button>
        </div>

        {/* Crew and Jobs in 2-column grid */}
        <div className="grid grid-cols-2 gap-2 min-w-0">
          {/* CREW BLOCK */}
          <div className={block}>
            <div className="flex items-center justify-between mb-1">
              <div className={headerLabel}>Crew</div>
              <button
                type="button"
                className={editBtn}
                onClick={() => setIsLeadModalOpen(true)}
                title="Select lead"
              >
                Edit
              </button>
            </div>

            <div className={scrollArea}>
              <div className="flex flex-wrap gap-2">
                {crew.map((emp) => {
                  const isLead = emp.id === leadId;
                  const hasPhone = !!emp.phone;
                  const label = `${emp.firstName ?? emp.name ?? "EMP"} ${
                    emp.lastName?.[0] ?? ""
                  }`.trim();

                  return (
                    <div
                      key={emp.id}
                      draggable
                      onDragStart={(e) =>
                        onDragStart(e, emp.id, "employee", truck.id)
                      }
                      onDragEnd={onDragEnd}
                      className={[chipBase, isLead ? chipLead : ""].join(" ")}
                      title={isLead ? "Lead" : emp.name}
                    >
                      <span
                        className={[dotBase, isLead ? dotLead : ""].join(" ")}
                      />
                      <span className="truncate max-w-[110px]">{label}</span>
                      {isLead && hasPhone && (
                        <span className="ml-1 text-emerald-200">{phoneIcon}</span>
                      )}
                    </div>
                  );
                })}
                {crew.length === 0 && (
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/25">
                    Assign crew
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* JOB BLOCK (3-row per job: name/time, flags, notes) */}
          <div className={block}>
            <div className="flex items-center justify-between mb-1">
              <div className={headerLabel}>Jobs</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/35">
                {jobs.length}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {jobs.map((job) => {
                const time = getJobTime(job);
                const customer = getJobCustomer(job);

                const flags = getJobFlags(job);
                const jobWarningLevel = getJobWarningLevel(job);
                const jobWarning = getJobWarningText(job);
                const notes = getJobNotes(job);

                const boxTone =
                  jobWarningLevel === "hard"
                    ? jobBoxHard
                    : jobWarningLevel === "soft"
                    ? jobBoxSoft
                    : jobBoxNone;

                const flagTone =
                  jobWarningLevel === "hard"
                    ? flagHard
                    : jobWarningLevel === "soft"
                    ? flagSoft
                    : flagNeutral;

                const noteText = notes || jobWarning || "";

                return (
                  <button
                    key={job.id}
                    type="button"
                    draggable
                    onDragStart={(e) => onDragStart(e, job.id, "job", truck.id)}
                    onDragEnd={onDragEnd}
                    onClick={() => onViewJobDetails(job)}
                    className={[jobBoxBase, boxTone].join(" ")}
                    title={jobWarning ? jobWarning : "Open job details"}
                  >
                    {/* Row 1: Time + Customer */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[8px] font-black uppercase tracking-widest text-sky-300/80 flex-shrink-0">
                        {time || "—"}
                      </span>
                      <span className="truncate text-[10px] font-black uppercase tracking-widest text-white/85">
                        {String(customer)}
                      </span>
                    </div>

                    {/* Row 2: Flags */}
                    {flags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {flags.slice(0, 6).map((f) => (
                          <span
                            key={f}
                            className={[flagPillBase, flagTone].join(" ")}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Row 3: Notes */}
                    {noteText && (
                      <div className="mt-2 text-[8px] text-white/60 line-clamp-1 italic">
                        {noteText}
                      </div>
                    )}
                  </button>
                );
              })}

              {jobs.length === 0 && (
                <div className="text-[9px] font-black uppercase tracking-widest text-white/25">
                  Drop contract
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fuel Modal (COMPACT) */}
      {isFuelModalOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-3"
          onMouseDown={() => setIsFuelModalOpen(false)}
        >
          <div
            className="w-full max-w-[420px] rounded-xl border border-white/10 bg-[#0b1220] shadow-[0_18px_70px_rgba(0,0,0,0.55)] overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.03]">
              <div className="min-w-0">
                <div className="text-[9px] font-black uppercase tracking-widest text-white/80 truncate">
                  Fuel — {truck.name}
                </div>
                <div className="text-[8px] font-black uppercase tracking-widest text-white/40">
                  Drag slider or tap %
                </div>
              </div>

              <button
                type="button"
                className="px-2 py-1 rounded-md border border-white/10 bg-white/[0.03] text-[8px] font-black uppercase tracking-widest text-white/70 hover:bg-white/[0.06]"
                onClick={() => setIsFuelModalOpen(false)}
              >
                Close
              </button>
            </div>

            {/* body */}
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-[22px] font-black tracking-tight text-white/90">
                  {fuelDraft}%
                </div>

                <div className="flex gap-1.5">
                  {[25, 50, 75, 100].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="px-2 py-1 rounded-md border border-white/10 bg-white/[0.03] text-[8px] font-black uppercase tracking-widest text-white/75 hover:bg-white/[0.06]"
                      onClick={() => setFuelDraft(v)}
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2">
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-cyan-300/70"
                    style={{ width: `${fuelDraft}%` }}
                  />
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={fuelDraft}
                  onChange={(e) => setFuelDraft(Number(e.target.value))}
                  className="mt-2 w-full accent-cyan-300"
                />
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded-md border border-white/10 bg-white/[0.03] text-[8px] font-black uppercase tracking-widest text-white/75 hover:bg-white/[0.06]"
                  onClick={() => setIsFuelModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded-md border border-emerald-400/25 bg-emerald-500/10 text-[8px] font-black uppercase tracking-widest text-emerald-200 hover:bg-emerald-500/15"
                  onClick={() => {
                    if (onFuelUpdate) onFuelUpdate(truck.id, fuelDraft);
                    setIsFuelModalOpen(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplies Modal (COMPACT) */}
      {isSuppliesModalOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-3"
          onMouseDown={() => setIsSuppliesModalOpen(false)}
        >
          <div
            className="w-full max-w-[520px] rounded-xl border border-white/10 bg-[#0b1220] shadow-[0_18px_70px_rgba(0,0,0,0.55)] overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.03]">
              <div className="min-w-0">
                <div className="text-[9px] font-black uppercase tracking-widest text-white/80 truncate">
                  Supplies — {truck.name}
                </div>
                <div className="text-[8px] font-black uppercase tracking-widest text-white/40">
                  Numbers only (counts)
                </div>
              </div>

              <button
                type="button"
                className="px-2 py-1 rounded-md border border-white/10 bg-white/[0.03] text-[8px] font-black uppercase tracking-widest text-white/70 hover:bg-white/[0.06]"
                onClick={() => setIsSuppliesModalOpen(false)}
              >
                Close
              </button>
            </div>

            {/* body */}
            <div className="p-3">
              <div className="max-h-[40vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {Object.keys(suppliesDraft).map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1"
                    >
                      <div className="text-[8px] font-black uppercase tracking-widest text-white/70 truncate">
                        {item}
                      </div>

                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={suppliesDraft[item] ?? 0}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setSuppliesDraft((prev) => ({
                            ...prev,
                            [item]: Number.isFinite(v) ? v : 0,
                          }));
                        }}
                        className="w-12 text-right rounded-md border border-white/10 bg-black/30 px-1 py-1 text-[8px] font-black uppercase tracking-widest text-white/80"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded-md border border-white/10 bg-white/[0.03] text-[8px] font-black uppercase tracking-widest text-white/75 hover:bg-white/[0.06]"
                  onClick={() => setIsSuppliesModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded-md border border-emerald-400/25 bg-emerald-500/10 text-[8px] font-black uppercase tracking-widest text-emerald-200 hover:bg-emerald-500/15"
                  onClick={() => {
                    // TODO: write supplies map to firestore trucks/{truckId}
                    setIsSuppliesModalOpen(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Flags (RESTORED) */}
      {active && (
        <div className="mt-auto border-t border-white/5 bg-white/[0.02] px-2 py-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Show fuel-specific warnings first */}
            {warning.fuelBand === "critical" && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-rose-400/25 bg-rose-500/10 text-rose-200">
                FUEL CRITICAL
              </span>
            )}
            {warning.fuelBand === "low" && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-amber-400/25 bg-amber-500/10 text-amber-200">
                FUEL LOW
              </span>
            )}

            {/* Show generic warning only if not fuel-related */}
            {warning.warningLevel !== "none" &&
              !muted &&
              warning.fuelBand === "normal" && (
                <span
                  className={[
                    "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border",
                    truckHard
                      ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
                      : "border-amber-400/30 bg-amber-500/10 text-amber-200",
                  ].join(" ")}
                  title={warning.warningNote ?? ""}
                >
                  {truckHard ? "TRUCK NOT READY" : "CHECK TRUCK"}
                </span>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
