import React, { useEffect, useState } from "react";

type QuickNotesModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (text: string) => Promise<void> | void;
};

export default function QuickNotesModal({ open, onClose, onSave }: QuickNotesModalProps) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setText("");
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    const clean = text.trim();
    if (!clean) return;
    try {
      setSaving(true);
      await onSave(clean);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Modal */}
      <div className="relative w-[720px] max-w-[92vw] rounded-2xl border border-white/10 bg-[#0b1220]/95 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-white/90 font-bold tracking-widest text-xs uppercase">
            Quick Notes
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white/90 text-xs font-bold px-2 py-1 rounded-lg border border-white/10 bg-white/5"
          >
            CLOSE
          </button>
        </div>

        <div className="mt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a note for Tim… (ex: crew requested off 11/22, customer upset, supplies low, call back needed)"
            className="w-full h-[140px] resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-white/85 placeholder:text-white/30 outline-none focus:border-white/20"
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-[10px] text-white/40 tracking-widest">
            Saves to Firestore for Make/AI to classify later
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !text.trim()}
              className={[
                "px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all",
                saving || !text.trim()
                  ? "border-white/10 bg-white/5 text-white/30 cursor-not-allowed"
                  : "border-emerald-400/25 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15 hover:border-emerald-300/40",
              ].join(" ")}
            >
              {saving ? "Saving…" : "Save Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
