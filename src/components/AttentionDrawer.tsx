import React from "react";

type AttentionPriority = "CRITICAL" | "HEADS_UP";

type AttentionDrawerProps = {
  open: boolean;
  priority: AttentionPriority;
  onClose: () => void;
};

export default function AttentionDrawer({ open, priority, onClose }: AttentionDrawerProps) {
  if (!open) return null;

  const title = priority === "CRITICAL" ? "Needs Attention" : "Heads Up";

  // mock items for now (no Firestore yet)
  const mock = priority === "CRITICAL"
    ? [
        { id: "c1", title: "Truck-2 fuel low", message: "Fuel looks low — confirm before dispatch." },
        { id: "c2", title: "Job missing phone", message: "Customer phone not set. Can’t send ETA." },
      ]
    : [
        { id: "h1", title: "Johnny requested off", message: "Requested off on 11/22. Not critical yet." },
        { id: "h2", title: "Reminder", message: "Confirm supplies order by end of day." },
      ];

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* panel */}
      <div className="absolute right-3 top-3 bottom-3 w-[420px] max-w-[92vw] rounded-2xl border border-white/10 bg-[#0b1220]/95 shadow-2xl p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-white font-black tracking-wide">{title}</div>
          <button
            className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            CLOSE
          </button>
        </div>

        <div className="mt-3 text-[11px] text-white/60">
          {priority === "CRITICAL"
            ? "Critical-only issues that block or risk jobs."
            : "Non-critical items and FYIs."}
        </div>

        <div className="mt-4 flex-1 overflow-auto space-y-2">
          {mock.map((it) => (
            <div key={it.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-white/90 font-bold text-[12px]">{it.title}</div>
              <div className="text-white/60 text-[11px] mt-1">{it.message}</div>

              <div className="mt-3 flex gap-2">
                <button
                  className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/10"
                  type="button"
                >
                  OPEN
                </button>
                <button
                  className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/10"
                  type="button"
                >
                  RESOLVE
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* footer slot for later */}
        <div className="pt-3 border-t border-white/10 text-[10px] text-white/50">
          Later: manual add, resolve, snooze, Firestore sync.
        </div>
      </div>
    </div>
  );
}
