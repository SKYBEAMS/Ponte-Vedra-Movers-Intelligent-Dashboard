// src/utils/history.ts
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function pushHistory<T>(history: T[], state: T, max = 60): T[] {
  const next = [...history, deepClone(state)];
  if (next.length > max) next.shift();
  return next;
}

export function popHistory<T>(history: T[]): { nextHistory: T[]; last: T | null } {
  if (history.length === 0) return { nextHistory: history, last: null };
  const nextHistory = history.slice(0, -1);
  const last = history[history.length - 1];
  return { nextHistory, last };
}
