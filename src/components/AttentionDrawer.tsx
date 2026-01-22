import React, { useEffect, useState } from "react";
import {
  AttentionItem,
  AttentionPriority,
  addAttentionItem,
  resolveAttentionItem,
  snoozeAttentionItem,
  subscribeAttentionListByStatus,
  unsnoozeAttentionItem,
} from "../firestore/attentionItems";

type AttentionDrawerProps = {
  open: boolean;
  priority: AttentionPriority;
  onClose: () => void;
};

export default function AttentionDrawer({ open, priority, onClose }: AttentionDrawerProps) {
  const [items, setItems] = useState<AttentionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [snoozeOpenId, setSnoozeOpenId] = useState<string | null>(null);
  const [view, setView] = useState<"UNRESOLVED" | "SNOOZED">("UNRESOLVED");
  const [resolveConfirmId, setResolveConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    const unsub = subscribeAttentionListByStatus(priority, view, (list) => {
      setItems(list);
      setLoading(false);
    });

    return () => unsub();
  }, [open, priority, view]);

  if (!open) return null;

  const isCritical = priority === "CRITICAL";
  const title = isCritical ? "Needs Attention" : "Heads Up";

  const pillClass = isCritical
    ? "bg-red-500/10 text-red-200 border-red-400/20"
    : "bg-amber-500/10 text-amber-200 border-amber-400/20";

  const cardAccent = isCritical ? "border-l-red-400/60" : "border-l-amber-400/60";

  const resolveBtn = isCritical
    ? "hover:border-red-400/40 hover:bg-red-500/10 hover:text-white hover:shadow-[0_0_18px_rgba(239,68,68,0.25)]"
    : "hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-white hover:shadow-[0_0_18px_rgba(245,158,11,0.18)]";

  const addHours = (d: Date, hours: number) => new Date(d.getTime() + hours * 60 * 60 * 1000);

  const endOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(23, 59, 0, 0);
    return x;
  };

  const tomorrowMorning = (d: Date) => {
    const x = new Date(d);
    x.setDate(x.getDate() + 1);
    x.setHours(8, 0, 0, 0);
    return x;
  };

  const handleSave = async () => {
    if (!newTitle) return;

    setSaving(true);
    await addAttentionItem({
      title: newTitle,
      message: newMessage,
      priority,
    });
    setNewTitle("");
    setNewMessage("");
    setSaving(false);
  };

  const handleSnooze = async (id: string) => {
    setSnoozeOpenId(null);
    await snoozeAttentionItem(id);
  };

  const displayedItems = items;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

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

        <div className={["mt-2 inline-flex px-2 py-1 rounded-lg border text-[10px] font-bold tracking-widest", pillClass].join(" ")}>
          {isCritical ? "CRITICAL" : "HEADS UP"}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setView("UNRESOLVED")}
            className={[
              "px-2 py-1 rounded-lg border text-[10px] font-black tracking-widest transition-all",
              view === "UNRESOLVED"
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10",
            ].join(" ")}
          >
            ACTIVE
          </button>

          <button
            type="button"
            onClick={() => setView("SNOOZED")}
            className={[
              "px-2 py-1 rounded-lg border text-[10px] font-black tracking-widest transition-all",
              view === "SNOOZED"
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10",
            ].join(" ")}
          >
            SNOOZED
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-auto space-y-2">
          {loading && (
            <div className="text-white/60 text-[11px]">Loading…</div>
          )}

          {!loading && displayedItems.length === 0 && (
            <div className="text-white/60 text-[11px]">
              No unresolved items right now.
            </div>
          )}

          {displayedItems.map((it) => (
            <div
              key={it.id}
              className={[
                "rounded-xl border border-white/10 bg-white/5 p-3 border-l-4",
                cardAccent,
              ].join(" ")}
            >
              <div className="text-white/90 font-bold text-[12px]">
                {it.title}
              </div>

              {it.message && (
                <div className="text-white/60 text-[11px] mt-1">{it.message}</div>
              )}

              <div className="mt-3 flex gap-2 items-center relative">
                <button
                  className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  type="button"
                >
                  OPEN
                </button>

                <button
                  className={[
                    "px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold tracking-widest text-white/70 transition-all",
                    resolveBtn,
                  ].join(" ")}
                  type="button"
                  onClick={() => setResolveConfirmId((prev) => (prev === it.id ? null : it.id || null))}
                >
                  RESOLVE
                </button>

                {resolveConfirmId === it.id && it.id && (
                  <div className="absolute left-0 mt-2 w-[260px] rounded-xl border border-white/10 bg-[#0b1220]/95 shadow-2xl p-3 z-50">
                    <div className="text-[11px] text-white/80 font-bold">Mark resolved?</div>
                    <div className="text-[10px] text-white/50 mt-1">
                      If you're not 100% sure, snooze it and add more info later.
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                      <button
                        type="button"
                        className="w-full px-2 py-2 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black tracking-widest text-white/70 hover:text-white hover:bg-white/10"
                        onClick={async () => {
                          setResolveConfirmId(null);
                          await resolveAttentionItem(it.id!);
                        }}
                      >
                        RESOLVE ANYWAY
                      </button>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          className="px-2 py-2 rounded-lg border border-white/10 bg-white/5 text-[9px] font-black tracking-widest text-white/70 hover:text-white hover:bg-white/10"
                          onClick={async () => {
                            setResolveConfirmId(null);
                            await snoozeAttentionItem(it.id!, addHours(new Date(), 1));
                          }}
                        >
                          1H
                        </button>

                        <button
                          type="button"
                          className="px-2 py-2 rounded-lg border border-white/10 bg-white/5 text-[9px] font-black tracking-widest text-white/70 hover:text-white hover:bg-white/10"
                          onClick={async () => {
                            setResolveConfirmId(null);
                            await snoozeAttentionItem(it.id!, endOfDay(new Date()));
                          }}
                        >
                          EOD
                        </button>

                        <button
                          type="button"
                          className="px-2 py-2 rounded-lg border border-white/10 bg-white/5 text-[9px] font-black tracking-widest text-white/70 hover:text-white hover:bg-white/10"
                          onClick={async () => {
                            setResolveConfirmId(null);
                            await snoozeAttentionItem(it.id!, tomorrowMorning(new Date()));
                          }}
                        >
                          TMR
                        </button>
                      </div>

                      <button
                        type="button"
                        className="w-full px-2 py-2 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black tracking-widest text-white/50 hover:text-white hover:bg-white/10"
                        onClick={() => setResolveConfirmId(null)}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}

                {view === "SNOOZED" ? (
                  <button
                    className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    type="button"
                    onClick={() => it.id && unsnoozeAttentionItem(it.id)}
                  >
                    UNSNOOZE
                  </button>
                ) : (
                  <div className="relative">
                    <button
                      className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all"
                      type="button"
                      onClick={() => setSnoozeOpenId((prev) => (prev === it.id ? null : it.id || null))}
                    >
                      SNOOZE
                    </button>

                    {snoozeOpenId === it.id && it.id && (
                      <div className="absolute right-0 mt-2 w-40 rounded-xl border border-white/10 bg-[#0b1220]/95 shadow-2xl overflow-hidden z-50">
                        <button
                          className="w-full text-left px-3 py-2 text-[11px] text-white/80 hover:bg-white/10"
                          type="button"
                          onClick={async () => {
                            setSnoozeOpenId(null);
                            await snoozeAttentionItem(it.id!, addHours(new Date(), 1));
                          }}
                        >
                          Snooze 1 hour
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-[11px] text-white/80 hover:bg-white/10"
                          type="button"
                          onClick={async () => {
                            setSnoozeOpenId(null);
                            await snoozeAttentionItem(it.id!, endOfDay(new Date()));
                          }}
                        >
                          Snooze until EOD
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-[11px] text-white/80 hover:bg-white/10"
                          type="button"
                          onClick={async () => {
                            setSnoozeOpenId(null);
                            await snoozeAttentionItem(it.id!, tomorrowMorning(new Date()));
                          }}
                        >
                          Snooze until tomorrow
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-white/10 space-y-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title (required)"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white placeholder:text-white/40"
          />

          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Details (optional)"
            rows={2}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white placeholder:text-white/40 resize-none"
          />

          <button
            disabled={!newTitle || saving}
            onClick={async () => {
              try {
                setSaving(true);
                await addAttentionItem({
                  priority,
                  status: "UNRESOLVED",
                  source: "MANUAL",
                  title: newTitle,
                  message: newMessage,
                  entityType: "SYSTEM",
                });
                setNewTitle("");
                setNewMessage("");
              } finally {
                setSaving(false);
              }
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 text-[10px] font-black tracking-widest text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-all"
            type="button"
          >
            ADD ITEM
          </button>
        </div>
      </div>
    </div>
  );
}
