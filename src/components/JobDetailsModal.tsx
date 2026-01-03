import React from "react";
import { ClipboardList, Clock, Phone, MapPin, AlertCircle, XCircle, MessageSquare } from "lucide-react";
import { Job } from "../types";

type Props = {
  job: Job | null;
  onClose: () => void;
};

export default function JobDetailsModal({ job, onClose }: Props) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg glass border border-sky-400/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(14,165,233,0.3)] animate-in fade-in zoom-in duration-300">
        <div className="bg-sky-500/10 p-6 border-b border-sky-400/20 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 text-sky-400 mb-2">
              <ClipboardList size={20} />
              <span className="font-tech text-xs font-bold tracking-[0.2em] uppercase">Job Specifications</span>
            </div>
            <h2 className="text-2xl font-bold text-white glow-text">{job.customerName}</h2>
            <div className="flex items-center space-x-2 text-white/60 text-sm mt-1">
              <Clock size={14} className="text-sky-400" />
              <span>Scheduled: {job.time}</span>
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
              <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Customer Phone</label>
              <div className="flex items-center space-x-2 text-white bg-white/5 p-3 rounded-xl border border-white/10">
                <Phone size={16} className="text-sky-400" />
                <span className="font-medium">{job.customerPhone}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Route Path</label>
              <div className="flex items-center space-x-2 text-white bg-white/5 p-3 rounded-xl border border-white/10">
                <MapPin size={16} className="text-sky-400" />
                <span className="font-medium">{job.fromTo}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center">
              <AlertCircle size={14} className="mr-2" /> Dispatcher Notes
            </label>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-white/80 text-sm leading-relaxed italic">
              {job.notes || "No special instructions provided for this contract."}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/5 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center justify-center space-x-2"
          >
            <span>Acknowledge & Close</span>
          </button>

          <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all">
            <MessageSquare size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
