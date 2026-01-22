import React, { useEffect, useState } from "react";
import {
  AttentionItem,
  AttentionPriority,
  AttentionStatus,
  addAttentionItem,
  resolveAttentionItem,
  snoozeAttentionItem,
  subscribeAttentionListByStatus,
  unsnoozeAttentionItem,
  reopenAttentionItem,
} from "../firestore/attentionItems";

type AttentionDrawerProps = {
  open: boolean;
  priority: AttentionPriority;
  onClose: () => void;
  onOptimisticAdd?: (priority: AttentionPriority) => void;
  onOptimisticRemove?: (priority: AttentionPriority) => void;
};

export default function AttentionDrawer({ open, priority, onClose, onOptimisticAdd, onOptimisticRemove }: AttentionDrawerProps) {
  const [items, setItems] = useState<AttentionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [snoozeOpenId, setSnoozeOpenId] = useState<string | null>(null);
  const [viewStatus, setViewStatus] = useState<AttentionStatus>("UNRESOLVED");
  const [resolveConfirmId, setResolveConfirmId] = useState<string | null>(null);
  const [resolvedFilter, setResolvedFilter] = useState<"TODAY" | "ALL">("TODAY");
  const [refreshKey, setRefreshKey] = useState(0);

  // Helper: start of today (America/New_York)
  const getStartOfTodayNY = () => {
    const now = new Date();
    const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    nyTime.setHours(0, 0, 0, 0);
    return nyTime;
  };

  useEffect(() => {
    if (!open) return;

    setError(null);
    setLoading(true);
    setItems([]);

    let unsub: (() => void) | null = null;

    try {
      unsub = subscribeAttentionListByStatus(
        priority,
        viewStatus,
        (list) => {
          setItems(list);
          setLoading(false);
        },
        (err) => {
          console.error("Attention subscription error:", err);
          setError(err.message || "Failed to load attention items");
          setLoading(false);
          setItems([]);
        }
      );
    } catch (err) {
      console.error("Failed to subscribe to attention items:", err);
      setError("Failed to subscribe to attention items");
      setLoading(false);
    }

    // Safety timeout: log if loading is still true after 3 seconds
    const timeoutId = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.error("Attention list still loading", { priority, viewStatus });
        }
        return prev;
      });
    }, 3000);

    return () => {
      if (unsub) unsub();
      clearTimeout(timeoutId);
    };
  }, [open, priority, viewStatus, refreshKey]);

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
    try {
      const newItem = await addAttentionItem({
        title: newTitle,
        message: newMessage,
        priority,
        status: "UNRESOLVED",
        source: "MANUAL",
        entityType: "SYSTEM",
      });
      // Optimistic update: add item to local state immediately
      if (newItem) {
        setItems((prev) => [newItem, ...prev]);
        onOptimisticAdd?.(newItem.priority);
      }
      setNewTitle("");
      setNewMessage("");
    } finally {
      setSaving(false);
    }
  };

  const handleSnooze = async (id: string) => {
    setSnoozeOpenId(null);
    await snoozeAttentionItem(id);
  };

  const handleRetry = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Filter items based on resolvedFilter if viewing RESOLVED
  const displayedItems =
    viewStatus === "RESOLVED" && resolvedFilter === "TODAY"
      ? items.filter((it) => {
          if (!it.resolvedAt) return false;
          const resolvedTime =
            typeof it.resolvedAt === "object" && it.resolvedAt.toDate
              ? it.resolvedAt.toDate()
              : new Date(it.resolvedAt);
          return resolvedTime >= getStartOfTodayNY();
        })
      : items;

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
            onClick={() => {
              setViewStatus("UNRESOLVED");
              setLoading(true);
              setItems([]);
            }}
            className={[
              "px-2 py-1 rounded-lg border text-[10px] font-black tracking-widest transition-all",
              viewStatus === "UNRESOLVED"
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10",
            ].join(" ")}
          >
            ACTIVE
          </button>

          <button
            type="button"
            onClick={() => {
              setViewStatus("SNOOZED");
              setLoading(true);
              setItems([]);
            }}
            className={[
              "px-2 py-1 rounded-lg border text-[10px] font-black tracking-widest transition-all",
              viewStatus === "SNOOZED"
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10",
            ].join(" ")}
          >
            SNOOZED
          </button>

          <button
            type="button"
            onClick={() => {
              setViewStatus("RESOLVED");
              setLoading(true);
              setItems([]);
            }}
            className={[
              "px-2 py-1 rounded-lg border text-[10px] font-black tracking-widest transition-all",
              viewStatus === "RESOLVED"
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10",
            ].join(" ")}
          >
            RESOLVED
          </button>
        </div>

        {/* Resolved filter toggle */}
        {viewStatus === "RESOLVED" && (
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setResolvedFilter("TODAY")}
              className={[
                "px-2 py-1 rounded-lg border text-[10px] font-black tracking-widest transition-all",
                resolvedFilter === "TODAY"
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10",
              ].join(" ")}
            >
              TODAY
            </button>
            <button
              type="button"
              onClick={() => setResolvedFilter("ALL")}
              className={[
                "px-2 py-1 rounded-lg border text-[10px] font-black tracking-widest transition-all",
                resolvedFilter === "ALL"
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10",
              ].join(" ")}
            >
              ALL
            </button>
          </div>
        )}

        <div className="mt-4 flex-1 overflow-auto space-y-2">
          {error && (
            <div className="flex items-center justify-between text-red-400/80 text-[11px] bg-red-500/10 border border-red-400/20 rounded-lg p-2">
              <span>⚠️ Firestore query failed (index). Check console.</span>
              <button
                type="button"
                onClick={handleRetry}
                className="ml-2 px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold text-[10px] whitespace-nowrap"
              >
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="text-white/60 text-[11px]">Loading…</div>
          )}

          {!loading && !error && displayedItems.length === 0 && (
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
                          setItems((prev) => prev.filter((x) => x.id !== it.id));
                          if (viewStatus === "UNRESOLVED") {
                            onOptimisticRemove?.(it.priority);
                          }
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
                            setItems((prev) => prev.filter((x) => x.id !== it.id));
                            if (viewStatus === "UNRESOLVED") {
                              onOptimisticRemove?.(it.priority);
                            }
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
                            setItems((prev) => prev.filter((x) => x.id !== it.id));
                            if (viewStatus === "UNRESOLVED") {
                              onOptimisticRemove?.(it.priority);
                            }
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
                            setItems((prev) => prev.filter((x) => x.id !== it.id));
                            if (viewStatus === "UNRESOLVED") {
                              onOptimisticRemove?.(it.priority);
                            }
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

                {viewStatus === "SNOOZED" ? (
                  <button
                    className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    type="button"
                    onClick={async () => {
                      if (it.id) {
                        setItems((prev) => prev.filter((x) => x.id !== it.id));
                        onOptimisticAdd?.(it.priority);
                        await unsnoozeAttentionItem(it.id);
                      }
                    }}
                  >
                    UNSNOOZE
                  </button>
                ) : viewStatus === "RESOLVED" ? (
                  <button
                    className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    type="button"
                    onClick={async () => {
                      if (it.id) {
                        setItems((prev) => prev.filter((x) => x.id !== it.id));
                        onOptimisticAdd?.(it.priority);
                        await reopenAttentionItem(it.id);
                      }
                    }}
                  >
                    REOPEN
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
                            setItems((prev) => prev.filter((x) => x.id !== it.id));
                            if (viewStatus === "UNRESOLVED") {
                              onOptimisticRemove?.(it.priority);
                            }
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
                            setItems((prev) => prev.filter((x) => x.id !== it.id));
                            if (viewStatus === "UNRESOLVED") {
                              onOptimisticRemove?.(it.priority);
                            }
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
                            setItems((prev) => prev.filter((x) => x.id !== it.id));
                            if (viewStatus === "UNRESOLVED") {
                              onOptimisticRemove?.(it.priority);
                            }
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
            onClick={handleSave}
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
