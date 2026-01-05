// ✅ src/components/JobDetailsModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Clock,
  Phone,
  MapPin,
  AlertCircle,
  XCircle,
  MessageSquare,
  Save,
  CalendarDays,
} from "lucide-react";
import { Job, JobStatus, JobFlag } from "../types";
import { FLAG_ICONS } from "../constants";
import { evaluateJobWarnings } from "../utils/jobwarnings";

type Props = {
  job: Job | null;
  onClose: () => void;
  onUpdateJob: (job: Job) => void;
};

// ---- time helpers (digits -> "h:mm", AM/PM dropdown) ----
function parseTimeDigitsToHm(digitsRaw: string): { hm: string; valid: boolean } {
  const digits = (digitsRaw || "").replace(/\D/g, "").slice(0, 4);

  if (!digits) return { hm: "", valid: false };

  if (digits.length <= 2) {
    const h = Number(digits);
    if (!h || h < 1 || h > 12) return { hm: "", valid: false };
    return { hm: `${h}:00`, valid: true };
  }

  if (digits.length === 3) {
    const h = Number(digits.slice(0, 1));
    const m = Number(digits.slice(1));
    if (!h || h < 1 || h > 12) return { hm: "", valid: false };
    if (m < 0 || m > 59) return { hm: "", valid: false };
    return { hm: `${h}:${String(m).padStart(2, "0")}`, valid: true };
  }

  const h = Number(digits.slice(0, 2));
  const m = Number(digits.slice(2));
  if (!h || h < 1 || h > 12) return { hm: "", valid: false };
  if (m < 0 || m > 59) return { hm: "", valid: false };
  return { hm: `${h}:${String(m).padStart(2, "0")}`, valid: true };
}

function splitFromTo(fromTo?: string) {
  const s = (fromTo || "").trim();
  if (!s) return { from: "", to: "" };
  const parts = s.split("→").map((p) => p.trim());
  if (parts.length >= 2) return { from: parts[0], to: parts.slice(1).join(" → ") };
  const dash = s.split("-").map((p) => p.trim());
  if (dash.length >= 2) return { from: dash[0], to: dash.slice(1).join(" - ") };
  return { from: s, to: "" };
}

function to24Hour(hm: string, ampm: "AM" | "PM"): { hour24: number; minute: number } | null {
  const [hRaw, mRaw] = hm.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (!h || h < 1 || h > 12) return null;
  if (Number.isNaN(m) || m < 0 || m > 59) return null;

  let hour24 = h % 12; // 12 -> 0
  if (ampm === "PM") hour24 += 12;
  return { hour24, minute: m };
}

/**
 * ✅ Truth update: keep the existing scheduledArrival DATE,
 * replace only the time (local time), then store ISO.
 */
function updateIsoTimeKeepDate(existingIso: string, hm: string, ampm: "AM" | "PM"): string {
  const base = new Date(existingIso);
  if (Number.isNaN(base.getTime())) return new Date().toISOString();

  const t = to24Hour(hm, ampm);
  if (!t) return existingIso;

  const local = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    t.hour24,
    t.minute,
    0,
    0
  );
  return local.toISOString();
}

/**
 * ✅ NEW: date helpers (date picker -> ISO keeping time)
 * - Date input is local "YYYY-MM-DD"
 * - We merge it into scheduledArrival while keeping the time portion
 */
function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function updateIsoDateKeepTime(existingIso: string, yyyyMmDd: string): string {
  const base = new Date(existingIso);
  if (Number.isNaN(base.getTime())) return new Date().toISOString();

  const [y, m, d] = yyyyMmDd.split("-").map((n) => Number(n));
  if (!y || !m || !d) return existingIso;

  // Keep the base time (local)
  const local = new Date(y, m - 1, d, base.getHours(), base.getMinutes(), 0, 0);
  return local.toISOString();
}

/* ✅ NEW: address -> clean label helpers for JobCard display */
function shortPlaceLabel(input: string): string {
  const s = (input || "").trim();
  if (!s) return "";

  // Already a short label (like "PV", "Jax Bch", "St Aug")
  if (s.length <= 12 && !/\d/.test(s) && !s.includes(",")) return s;

  // "City, ST ..." -> "City"
  const firstPart = s.split(",")[0]?.trim();
  if (firstPart && firstPart.length <= 12) return firstPart;

  // fallback: last word(s)
  const words = (firstPart || s).split(/\s+/).filter(Boolean);
  const last = words[words.length - 1] || s;
  const secondLast = words[words.length - 2] || "";
  const candidate = (secondLast ? `${secondLast} ${last}` : last).trim();

  return candidate.length > 12 ? candidate.slice(0, 12) : candidate;
}

function makeFromToLabel(pickup: string, dropoff: string): string {
  const a = shortPlaceLabel(pickup);
  const b = shortPlaceLabel(dropoff);
  if (!a && !b) return "";
  return `${a || "—"} → ${b || "—"}`;
}

export default function JobDetailsModal({ job, onClose, onUpdateJob }: Props) {
  if (!job) return null;

  const [draft, setDraft] = useState<Job>(job);

  const initialAmPm = (job.time || "").toUpperCase().includes("PM") ? "PM" : "AM";
  const [ampm, setAmpm] = useState<"AM" | "PM">(initialAmPm);

  const initialDigits = (job.time || "").replace(/\D/g, "").slice(0, 4);
  const [timeDigits, setTimeDigits] = useState<string>(initialDigits);

  // ✅ Route Path truth fields
  const initialRoute = splitFromTo(job.fromTo);
  const [pickupAddress, setPickupAddress] = useState<string>(job.pickupAddress ?? initialRoute.from);
  const [dropoffAddress, setDropoffAddress] = useState<string>(job.dropoffAddress ?? initialRoute.to);

  // ✅ Date picker state (derived from scheduledArrival)
  const [dateValue, setDateValue] = useState<string>(() => {
    const iso = job.scheduledArrival || new Date().toISOString();
    return toDateInputValue(iso);
  });

  useEffect(() => {
    setDraft(job);

    const nextAmPm = (job.time || "").toUpperCase().includes("PM") ? "PM" : "AM";
    setAmpm(nextAmPm);

    setTimeDigits((job.time || "").replace(/\D/g, "").slice(0, 4));

    const route = splitFromTo(job.fromTo);
    setPickupAddress(job.pickupAddress ?? route.from);
    setDropoffAddress(job.dropoffAddress ?? route.to);

    const iso = job.scheduledArrival || new Date().toISOString();
    setDateValue(toDateInputValue(iso));
  }, [job]);

  const timeHm = useMemo(() => {
    const { hm, valid } = parseTimeDigitsToHm(timeDigits);
    return valid ? hm : "";
  }, [timeDigits]);

  const timeDerived = useMemo(() => {
    if (!timeHm) return "";
    return `${timeHm} ${ampm}`;
  }, [timeHm, ampm]);

  const timeValid = useMemo(() => parseTimeDigitsToHm(timeDigits).valid, [timeDigits]);

  const toggleFlag = (flag: JobFlag) => {
    setDraft((prev) => {
      const has = prev.flags?.includes(flag);
      const nextFlags = has ? prev.flags.filter((f) => f !== flag) : [...(prev.flags || []), flag];
      return { ...prev, flags: nextFlags };
    });
  };

  const save = () => {
    const nextStatus = draft.status ?? JobStatus.READY;

    // ✅ Always save a clean label for card display
    const composedFromTo = makeFromToLabel(pickupAddress, dropoffAddress);

    // ✅ scheduledArrival is source of truth:
    // 1) Ensure we have a base ISO
    // 2) Apply date picker (keep time)
    // 3) Apply time editor (keep date)
    let nextScheduledArrival = draft.scheduledArrival || new Date().toISOString();

    if (dateValue) {
      nextScheduledArrival = updateIsoDateKeepTime(nextScheduledArrival, dateValue);
    }

    if (timeHm) {
      nextScheduledArrival = updateIsoTimeKeepDate(nextScheduledArrival, timeHm, ampm);
    }

    const updated: Job = {
      ...draft,
      status: nextStatus,
      time: timeDerived || draft.time,
      scheduledArrival: nextScheduledArrival,

      // ✅ Truth fields stored (full strings)
      pickupAddress: pickupAddress.trim(),
      dropoffAddress: dropoffAddress.trim(),

      // ✅ Display label (short)
      fromTo: composedFromTo,
    };

    onUpdateJob(evaluateJobWarnings(updated));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg glass border border-sky-400/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(14,165,233,0.3)] animate-in fade-in zoom-in duration-300">
        <div className="bg-sky-500/10 p-6 border-b border-sky-400/20 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 text-sky-400 mb-2">
              <ClipboardList size={20} />
              <span className="font-tech text-xs font-bold tracking-[0.2em] uppercase">
                Job Specifications
              </span>
            </div>

            <input
              value={draft.customerName}
              onChange={(e) => setDraft((p) => ({ ...p, customerName: e.target.value }))}
              placeholder="Customer Name"
              className="w-full text-2xl font-bold text-white glow-text bg-transparent outline-none border-b border-white/10 focus:border-sky-400/50 pb-1"
            />

            {/* Date + Time row */}
            <div className="flex flex-wrap items-center gap-2 text-white/60 text-sm mt-2">
              <Clock size={14} className="text-sky-400" />
              <span className="text-white/60">Scheduled:</span>

              {/* ✅ Date picker */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <CalendarDays size={14} className="text-sky-400" />
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) => {
                    const next = e.target.value;
                    setDateValue(next);

                    // Keep draft.scheduledArrival in sync immediately (truth field)
                    setDraft((p) => {
                      const baseIso = p.scheduledArrival || new Date().toISOString();
                      const nextIso = next ? updateIsoDateKeepTime(baseIso, next) : baseIso;
                      return { ...p, scheduledArrival: nextIso };
                    });
                  }}
                  className="bg-transparent outline-none text-white/80"
                />
              </div>

              <input
                value={timeDigits}
                onChange={(e) => setTimeDigits(e.target.value)}
                placeholder="e.g. 930"
                className="w-[120px] bg-transparent outline-none border-b border-white/10 focus:border-sky-400/50 text-white/80"
                inputMode="numeric"
              />

              <select
                value={ampm}
                onChange={(e) => setAmpm(e.target.value as "AM" | "PM")}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/80 outline-none focus:border-sky-400/40"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>

              <span className={`text-xs ml-2 ${timeValid ? "text-white/70" : "text-amber-300"}`}>
                {timeValid ? timeDerived : "Invalid time"}
              </span>
            </div>

            <div className="mt-2 text-[10px] uppercase tracking-widest text-white/50">
              Status: <span className="text-white/80 font-bold">{draft.status}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                Customer Phone
              </label>
              <div className="flex items-center space-x-2 text-white bg-white/5 p-3 rounded-xl border border-white/10">
                <Phone size={16} className="text-sky-400" />
                <input
                  value={draft.customerPhone}
                  onChange={(e) => setDraft((p) => ({ ...p, customerPhone: e.target.value }))}
                  placeholder="(904) 555-0000"
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                Route Path
              </label>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-white bg-white/5 p-3 rounded-xl border border-white/10">
                  <MapPin size={16} className="text-sky-400" />
                  <input
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="From address / area"
                    className="w-full bg-transparent outline-none text-white"
                  />
                </div>

                <div className="flex items-center space-x-2 text-white bg-white/5 p-3 rounded-xl border border-white/10">
                  <MapPin size={16} className="text-sky-400" />
                  <input
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    placeholder="To address / area"
                    className="w-full bg-transparent outline-none text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
              Flags
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.values(JobFlag) as JobFlag[]).map((flag) => {
                const active = draft.flags?.includes(flag);
                return (
                  <button
                    key={flag}
                    type="button"
                    onClick={() => toggleFlag(flag)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold tracking-wider flex items-center gap-2 transition-all  
                      ${
                        active
                          ? "bg-sky-500/20 border-sky-400/40 text-white"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                      }`}
                    title={flag}
                  >
                    <span className="opacity-90">{FLAG_ICONS?.[flag]}</span>
                    <span>{flag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center">
              <AlertCircle size={14} className="mr-2" /> Dispatcher Notes
            </label>
            <textarea
              value={draft.notes || ""}
              onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Add instructions, access notes, special items, etc."
              className="w-full min-h-[110px] bg-white/5 p-4 rounded-xl border border-white/10 text-white/80 text-sm leading-relaxed outline-none focus:border-sky-400/40"
            />
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/5 flex items-center gap-3">
          <button
            onClick={save}
            className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center justify-center space-x-2"
          >
            <Save size={18} />
            <span>Save</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all font-bold"
          >
            Cancel
          </button>

          <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all">
            <MessageSquare size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
